"""Small, side-effect-free helpers for task-scoped preprocessing.

The existing preprocessing functions operate on the complete task JSON and
write their result to a directory.  These helpers keep task selection and
resource-expression evaluation outside those algorithms so the batch path
remains unchanged.
"""

from copy import deepcopy
import csv
from datetime import datetime
import os
import re
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Set, Tuple


Token = Tuple[str, str]
Expression = Tuple[Any, ...]


def _timestamp(value: Any) -> Optional[float]:
    text = _text(value)
    if not text:
        return None
    try:
        number = float(text)
        return number
    except ValueError:
        pass

    normalized = text.replace("Z", "+00:00").replace("_", " ")
    try:
        return datetime.fromisoformat(normalized).timestamp()
    except ValueError:
        return None


def task_time_bounds(task_data: Mapping[str, Any]) -> Optional[Tuple[float, float]]:
    starts: List[float] = []
    ends: List[float] = []
    for prop in task_data.get("taskPropList", []) if isinstance(task_data, Mapping) else []:
        if not isinstance(prop, Mapping):
            continue
        for field in ("singlePeriodData", "singleDiscreteData", "repeatPeriodData", "repeatDiscreteData"):
            for window in prop.get(field, []) or []:
                if not isinstance(window, Mapping):
                    continue
                start = _timestamp(window.get("startTime", window.get("start_time")))
                end = _timestamp(window.get("endTime", window.get("end_time")))
                if start is not None and end is not None and end > start:
                    starts.append(start)
                    ends.append(end)
    if not starts or not ends:
        return None
    return min(starts), max(ends)


def _csv_timestamp_bounds(file_path: str) -> Optional[Tuple[float, float]]:
    try:
        with open(file_path, "r", encoding="utf-8-sig", newline="") as source:
            rows = csv.DictReader(source)
            starts = [_timestamp(row.get("start_timestamp")) for row in rows]
    except (OSError, csv.Error):
        return None

    starts = [value for value in starts if value is not None]
    if not starts:
        return None

    with open(file_path, "r", encoding="utf-8-sig", newline="") as source:
        rows = csv.DictReader(source)
        ends = [_timestamp(row.get("end_timestamp")) for row in rows]
    ends = [value for value in ends if value is not None]
    return (min(starts), max(ends)) if ends else None


def _shift_csv_timestamps(file_path: str, delta: float, output_dir: str) -> str:
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"aligned_{os.path.basename(file_path)}")
    with open(file_path, "r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        fieldnames = reader.fieldnames or []
        with open(output_path, "w", encoding="utf-8", newline="") as target:
            writer = csv.DictWriter(target, fieldnames=fieldnames)
            writer.writeheader()
            for row in reader:
                for field in ("start_timestamp", "end_timestamp"):
                    value = _timestamp(row.get(field))
                    if value is not None:
                        row[field] = str(int(value + delta))
                writer.writerow(row)
    return output_path


def align_solar_data_to_tasks(
    sun_file_path: Optional[str],
    umbra_file_path: Optional[str],
    task_data: Mapping[str, Any],
    output_dir: str,
) -> Tuple[Optional[str], Optional[str]]:
    """Use a temporary date-aligned copy when built-in visibility data is out of range."""
    task_bounds = task_time_bounds(task_data)
    if not task_bounds:
        return sun_file_path, umbra_file_path

    task_start, task_end = task_bounds

    def align_one(file_path: Optional[str]) -> Optional[str]:
        if not file_path or not os.path.exists(file_path):
            return file_path
        source_bounds = _csv_timestamp_bounds(file_path)
        if not source_bounds:
            return file_path
        source_start, source_end = source_bounds
        if task_start <= source_end and task_end >= source_start:
            return file_path
        return _shift_csv_timestamps(file_path, task_start - source_start, output_dir)

    return align_one(sun_file_path), align_one(umbra_file_path)


def _text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _item_name(item: Any) -> str:
    if isinstance(item, str):
        return _text(item)
    if not isinstance(item, Mapping):
        return ""
    for field in (
        "resourceName",
        "resource_name",
        "resourcePoolName",
        "resource_pool_name",
        "poolName",
        "pool_name",
        "resourceGroupName",
        "resource_group_name",
        "name",
        "value",
        "key",
    ):
        value = _text(item.get(field))
        if value:
            return value
    return ""


def _aliases(values: Iterable[str]) -> set[str]:
    return {value.casefold() for value in values if value}


def resource_catalog_aliases(resources: Any) -> Set[str]:
    """Collect expression aliases from the uploaded measurement-resource JSON."""
    aliases: Set[str] = set()
    values = resources if isinstance(resources, list) else []
    for resource in values:
        if not isinstance(resource, Mapping):
            continue
        station = _text(
            resource.get("station")
            or resource.get("cekong_station")
            or resource.get("station_name")
        )
        craft = _text(
            resource.get("craft")
            or resource.get("task_to_craft")
            or resource.get("taskToCraft")
        )
        resource_id = _text(
            resource.get("id")
            or resource.get("cekong_resource_id")
            or resource.get("resource_id")
        )
        resource_name = _text(
            resource.get("resourceName")
            or resource.get("resource_name")
            or resource.get("name")
        )
        aliases.update(value for value in (station, resource_id, resource_name) if value)
        if station and craft:
            aliases.add(f"{station}-{craft.removeprefix('CSS_')}")
    return aliases


def tokenize_resource_expression(expression: str, known_operands: Optional[Iterable[str]] = None) -> List[Token]:
    text = _text(expression)
    tokens: List[Token] = []
    index = 0
    ordered_operands = sorted(
        {_text(value) for value in (known_operands or []) if _text(value)},
        key=len,
        reverse=True,
    )

    while index < len(text):
        if text[index].isspace():
            index += 1
            continue
        if text[index] in "()":
            tokens.append((text[index], text[index]))
            index += 1
            continue

        operator = re.match(r"(?:and|or)(?=\s|[()]|$)", text[index:], re.IGNORECASE)
        if operator:
            value = operator.group(0).casefold()
            tokens.append(("operator", value))
            index += len(operator.group(0))
            continue

        operand = next(
            (
                value
                for value in ordered_operands
                if text.casefold().startswith(value.casefold(), index)
                and (
                    index + len(value) == len(text)
                    or text[index + len(value)].isspace()
                    or text[index + len(value)] in "()"
                )
            ),
            None,
        )
        if operand:
            tokens.append(("operand", text[index:index + len(operand)]))
            index += len(operand)
            continue

        operand_match = re.match(r"[^\s()]+", text[index:])
        if not operand_match:
            raise ValueError("资源需求表达式包含无法识别的字符")
        value = operand_match.group(0)
        tokens.append(("operand", value))
        index += len(value)

    return tokens


class _ExpressionParser:
    def __init__(self, tokens: Sequence[Token]):
        self.tokens = tokens
        self.cursor = 0

    def current(self) -> Optional[Token]:
        if self.cursor >= len(self.tokens):
            return None
        return self.tokens[self.cursor]

    def consume(self) -> Token:
        token = self.current()
        if token is None:
            raise ValueError("资源需求表达式末尾缺少资源或资源组")
        self.cursor += 1
        return token

    def parse(self) -> Expression:
        if not self.tokens:
            raise ValueError("资源需求表达式不能为空")
        result = self.parse_or()
        if self.current() is not None:
            token = self.current()
            if token[0] == ")":
                raise ValueError("资源需求表达式括号不匹配")
            raise ValueError(f"资源需求表达式缺少运算符：{token[1]}")
        return result

    def parse_or(self) -> Expression:
        result = self.parse_and()
        while self.current() == ("operator", "or"):
            self.consume()
            result = ("or", result, self.parse_and())
        return result

    def parse_and(self) -> Expression:
        result = self.parse_primary()
        while self.current() == ("operator", "and"):
            self.consume()
            result = ("and", result, self.parse_primary())
        return result

    def parse_primary(self) -> Expression:
        token = self.consume()
        if token[0] == "operand":
            return ("value", token[1])
        if token[0] == "(":
            result = self.parse_or()
            if self.current() != (")", ")"):
                raise ValueError("资源需求表达式括号不匹配：缺少右括号")
            self.consume()
            return result
        if token[0] == ")":
            raise ValueError("资源需求表达式括号不匹配：存在多余右括号")
        raise ValueError(f"资源需求表达式运算符前缺少资源或资源组：{token[1]}")


def parse_resource_expression(
    expression: str,
    known_operands: Optional[Iterable[str]] = None,
) -> Optional[Expression]:
    if not _text(expression):
        return None
    return _ExpressionParser(tokenize_resource_expression(expression, known_operands)).parse()


def _resource_aliases(event: Mapping[str, Any]) -> Set[str]:
    aliases: Set[str] = set()
    craft_values = {
        _text(event.get("task_to_craft")),
        _text(event.get("taskToCraft")),
        _text(event.get("craft")),
    }
    craft_values.discard("")
    expanded_crafts = set(craft_values)
    for craft in list(craft_values):
        if craft.startswith("CSS_"):
            expanded_crafts.add(craft.removeprefix("CSS_"))

    resources = event.get("cekong_resource", event.get("resources", [])) or []
    if isinstance(resources, (str, bytes)):
        resources = [resources]

    for resource in resources:
        if isinstance(resource, str):
            aliases.add(resource)
            continue
        if not isinstance(resource, Mapping):
            continue
        station = _text(
            resource.get("cekong_station")
            or resource.get("station")
            or resource.get("station_name")
        )
        resource_id = _text(
            resource.get("cekong_resource_id")
            or resource.get("resource_id")
            or resource.get("id")
        )
        resource_name = _text(
            resource.get("resourceName")
            or resource.get("resource_name")
            or resource.get("name")
        )
        aliases.update(value for value in (station, resource_id, resource_name) if value)
        if station:
            aliases.update(f"{station}-{craft}" for craft in expanded_crafts)

    return _aliases(aliases)


def _resource_group_aliases(resource_groups: Sequence[Mapping[str, Any]]) -> Dict[str, Set[str]]:
    groups: Dict[str, Set[str]] = {}
    for group in resource_groups or []:
        if not isinstance(group, Mapping):
            continue
        group_name = _item_name(group)
        if not group_name:
            continue
        included = group.get("includeResourceList", group.get("include", [])) or []
        excluded = group.get("excludeResourceList", group.get("exclude", [])) or []
        included_aliases = _aliases(_item_name(item) for item in included)
        excluded_aliases = _aliases(_item_name(item) for item in excluded)
        groups[group_name.casefold()] = included_aliases - excluded_aliases
    return groups


def _resource_pool_definitions(
    resource_pools: Sequence[Mapping[str, Any]],
    groups: Mapping[str, Set[str]],
    reserved_names: Optional[Set[str]] = None,
) -> Dict[str, Tuple[str, Set[str], Optional[int]]]:
    pools: Dict[str, Tuple[str, Set[str], Optional[int]]] = {}
    reserved_names = reserved_names or set()
    for pool in resource_pools or []:
        if not isinstance(pool, Mapping):
            continue
        pool_name = _item_name(pool)
        if not pool_name:
            raise ValueError("资源池名称不能为空")
        normalized_name = pool_name.casefold()
        if normalized_name in reserved_names or normalized_name in groups:
            raise ValueError(f"资源池名称与资源或资源组重名：{pool_name}")
        if normalized_name in pools:
            raise ValueError(f"当前任务存在重名资源池：{pool_name}")
        direct = pool.get("resourceList", pool.get("resources", [])) or []
        group_names = pool.get("resourceGroupList", pool.get("groups", [])) or []
        members = _aliases(_item_name(item) for item in direct)
        for group_name in group_names:
            members.update(groups.get(_item_name(group_name).casefold(), set()))
        mode = _text(pool.get("selectionMode", pool.get("mode", "all"))).casefold()
        if mode not in {"all", "count"}:
            raise ValueError(f"资源池选择模式无效：{pool_name}")
        if not members:
            raise ValueError(f"资源池展开后没有有效资源：{pool_name}")
        count_value = pool.get("requiredCount", pool.get("count"))
        try:
            required_count = int(count_value) if count_value is not None else None
        except (TypeError, ValueError):
            required_count = None
        if mode == "count" and (
            required_count is None
            or required_count <= 0
            or required_count > len(members)
        ):
            raise ValueError(f"资源池指定数量必须是 1 到 {len(members)} 的整数：{pool_name}")
        pools[normalized_name] = (
            mode,
            members,
            required_count,
        )
    return pools


def _expression_operands(expression: Optional[Expression]) -> Set[str]:
    if expression is None:
        return set()
    if expression[0] == "value":
        return {str(expression[1]).casefold()}
    return _expression_operands(expression[1]) | _expression_operands(expression[2])


def validate_resource_requirement(
    requirement: str,
    resource_groups: Optional[Sequence[Mapping[str, Any]]] = None,
    resource_pools: Optional[Sequence[Mapping[str, Any]]] = None,
    known_resources: Optional[Iterable[str]] = None,
) -> Optional[Expression]:
    """Validate one task expression and its task-scoped pool definitions."""
    groups = _resource_group_aliases(resource_groups or [])
    resource_names = _aliases(known_resources or [])
    pools = _resource_pool_definitions(resource_pools or [], groups, resource_names)
    known_operands = resource_names | set(groups.keys()) | set(pools.keys())
    parsed = parse_resource_expression(requirement, known_operands)
    unknown = sorted(_expression_operands(parsed) - known_operands)
    if unknown:
        raise ValueError("资源需求表达式包含未知资源、资源组或资源池：" + "、".join(unknown))
    return parsed


def _evaluate(
    expression: Expression,
    aliases: Set[str],
    groups: Mapping[str, Set[str]],
    pools: Mapping[str, Tuple[str, Set[str], Optional[int]]],
) -> bool:
    operator = expression[0]
    if operator == "value":
        value = expression[1].casefold()
        if value in aliases:
            return True
        group_members = groups.get(value)
        if group_members:
            return bool(aliases.intersection(group_members))
        pool = pools.get(value)
        if not pool:
            return False
        mode, members, required_count = pool
        matched_count = len(aliases.intersection(members))
        if mode == "count":
            return bool(required_count and matched_count >= required_count)
        return bool(members) and members.issubset(aliases)
    if operator == "and":
        return _evaluate(expression[1], aliases, groups, pools) and _evaluate(expression[2], aliases, groups, pools)
    if operator == "or":
        return _evaluate(expression[1], aliases, groups, pools) or _evaluate(expression[2], aliases, groups, pools)
    raise ValueError("资源需求表达式包含未知节点")


def filter_candidate_events_by_requirements(
    events: Sequence[Mapping[str, Any]],
    requirements: Optional[Mapping[str, str]] = None,
    resource_groups: Optional[Sequence[Mapping[str, Any]]] = None,
    resource_pools: Optional[Sequence[Mapping[str, Any]]] = None,
    known_resources: Optional[Iterable[str]] = None,
) -> List[Dict[str, Any]]:
    requirements = requirements or {}
    groups = _resource_group_aliases(resource_groups or [])
    parsed_by_requirement: Dict[str, Optional[Expression]] = {}
    filtered: List[Dict[str, Any]] = []
    resource_names = _aliases(known_resources or [])
    for candidate in events or []:
        resource_names.update(_resource_aliases(candidate))

    for event in events or []:
        task_key = _text(event.get("task_key") or event.get("taskKey"))
        task_name = _text(event.get("task_name") or event.get("taskName"))
        requirement = requirements[task_key] if task_key in requirements else requirements.get(task_name, "")
        requirement = _text(requirement)
        task_pools = [
            pool for pool in resource_pools or []
            if isinstance(pool, Mapping)
            and (
                not _text(pool.get("taskKey") or pool.get("task_key"))
                or _text(pool.get("taskKey") or pool.get("task_key")) in {task_key, task_name}
            )
        ]
        pools = _resource_pool_definitions(task_pools, groups, resource_names)
        known_operands = resource_names | set(groups.keys()) | set(pools.keys())
        parsed_key = (requirement, task_key or task_name)
        if parsed_key not in parsed_by_requirement:
            parsed = parse_resource_expression(requirement, known_operands)
            unknown = sorted(_expression_operands(parsed) - known_operands)
            if unknown:
                raise ValueError("资源需求表达式包含未知资源、资源组或资源池：" + "、".join(unknown))
            parsed_by_requirement[parsed_key] = parsed
        parsed = parsed_by_requirement[parsed_key]
        if parsed is None or _evaluate(parsed, _resource_aliases(event), groups, pools):
            filtered.append(dict(event))

    return filtered


def select_task_json(task_data: Mapping[str, Any], task_identifier: str):
    """Return a one-task copy and its original form-head record."""
    if not isinstance(task_data, Mapping):
        raise ValueError("任务 JSON 格式不正确")
    identifier = _text(task_identifier)
    heads = task_data.get("taskFormHeadList") or []
    task = next(
        (item for item in heads if isinstance(item, Mapping) and _text(item.get("key")) == identifier),
        None,
    )
    if task is None:
        name_matches = [
            item for item in heads
            if isinstance(item, Mapping) and _text(item.get("taskName")) == identifier
        ]
        if len(name_matches) > 1:
            raise ValueError(f"任务名称不唯一，请使用任务 key：{identifier}")
        task = name_matches[0] if name_matches else None
    if task is None:
        raise ValueError(f"任务不存在：{identifier}")

    selected_key = _text(task.get("key"))
    selected_name = _text(task.get("taskName"))
    selected = deepcopy(dict(task_data))
    for list_name in (
        "taskFormHeadList",
        "taskBasicInfoList",
        "taskPropList",
        "taskDurationList",
    ):
        values = selected.get(list_name)
        if isinstance(values, list):
            selected[list_name] = [
                item
                for item in values
                if isinstance(item, Mapping)
                and _text(item.get("key")) == selected_key
            ]

    pools = selected.get("taskResourcePoolList")
    if isinstance(pools, list):
        selected["taskResourcePoolList"] = [
            item for item in pools
            if isinstance(item, Mapping)
            and _text(item.get("taskKey") or item.get("task_key")) in {selected_key, selected_name}
        ]

    scheduler_state = selected.get("taskSchedulerStateMap")
    if isinstance(scheduler_state, dict):
        selected["taskSchedulerStateMap"] = {
            key: value
            for key, value in scheduler_state.items()
            if _text(key) in {selected_key, selected_name}
        }
    elif isinstance(scheduler_state, list):
        selected["taskSchedulerStateMap"] = [
            item
            for item in scheduler_state
            if isinstance(item, list)
            and len(item) == 2
            and _text(item[0]) in {selected_key, selected_name}
        ]

    return selected, dict(task)
