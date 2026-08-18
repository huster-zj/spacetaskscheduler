describe('Story 1.8 shared UI smoke check', () => {
  const login = () => {
    cy.visit('/login')
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('123456')
    cy.get('form').submit()
    cy.url().should('not.include', '/login')
  }

  const assertViewport = () => {
    cy.document().then((document) => {
      const viewportWidth = document.defaultView?.innerWidth || 0
      expect(viewportWidth).to.be.greaterThan(0)
      expect(document.documentElement.scrollWidth).to.be.at.most(viewportWidth)
      expect(document.body.scrollWidth).to.be.at.most(viewportWidth)
    })
  }

  ;[
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 390, height: 844 }
  ].forEach(({ name, width, height }) => {
    it(`keeps the application shell usable at ${name} size`, () => {
      cy.viewport(width, height)
      login()

      cy.visit('/attributes')
      cy.get('h1').contains('属性配置').should('be.visible')
      cy.get('[role="status"]').should('contain', '自动保存')
      cy.get('button.custom_btn').should('not.exist')
      cy.get('button[aria-label="下载示例规划包"]').focus()
      cy.get('button[aria-label="下载示例规划包"]').should('be.focused')
      cy.get('button[aria-label="退出登录"]').should('have.attr', 'title', '退出登录')
      assertViewport()

      cy.get('a[href="/resource"]').first().click()
      cy.get('h1').contains('资源管理').should('be.visible')
      assertViewport()

      cy.get('a[href="/task"]').first().click()
      cy.get('h1').contains('任务管理').should('be.visible')
      assertViewport()

      cy.get('a[href="/main_view"]').first().click()
      cy.get('h1').contains('调度主视图').should('be.visible')
      assertViewport()

      cy.get('a[href="/operating"]').first().click()
      cy.get('h1').contains('运行配置').should('be.visible')
      assertViewport()

      cy.get('a[href="/report"]').first().click()
      cy.get('h1').contains('规划报告').should('be.visible')
      assertViewport()
    })
  })
})
