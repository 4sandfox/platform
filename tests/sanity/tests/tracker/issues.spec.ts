import { test } from '@playwright/test'
import { generateId, PlatformSetting, PlatformURI } from '../utils'
import { LeftSideMenuPage } from '../model/left-side-menu-page'
import { IssuesPage } from '../model/tracker/issues-page'
import { IssuesDetailsPage } from '../model/tracker/issues-details-page'
import { Issue, NewIssue } from '../model/tracker/types'
import { allure } from 'allure-playwright'

test.use({
  storageState: PlatformSetting
})

test.describe('Tracker issue tests', () => {
  test.beforeEach(async ({ page }) => {
    await allure.parentSuite('Tracker tests')
    await (await page.goto(`${PlatformURI}/workbench/sanity-ws`))?.finished()
  })

  test('Create an issue with all parameters and attachments', async ({ page }) => {
    const newIssue: NewIssue = {
      title: `Issue with all parameters and attachments-${generateId()}`,
      description: 'Created issue with all parameters and attachments description',
      status: 'In Progress',
      priority: 'Urgent',
      assignee: 'Appleseed John',
      createLabel: true,
      labels: `CREATE-ISSUE-${generateId()}`,
      component: 'No component',
      estimation: '2',
      milestone: 'No Milestone',
      duedate: 'today',
      filePath: 'cat.jpeg'
    }

    const leftSideMenuPage = new LeftSideMenuPage(page)
    await leftSideMenuPage.buttonTracker.click()

    const issuesPage = new IssuesPage(page)
    await issuesPage.modelSelectorAll.click()
    await issuesPage.createNewIssue(newIssue)
    await issuesPage.searchIssueByName(newIssue.title)
    await issuesPage.openIssueByName(newIssue.title)

    const issuesDetailsPage = new IssuesDetailsPage(page)
    await issuesDetailsPage.checkIssue({
      ...newIssue,
      milestone: 'Milestone',
      estimation: '2h'
    })
  })

  test('Edit an issue', async ({ page }) => {
    const newIssue: NewIssue = {
      title: `Issue with all parameters and attachments-${generateId()}`,
      description: 'Created issue with all parameters and attachments description'
    }

    const editIssue: Issue = {
      status: 'Done',
      priority: 'High',
      createLabel: true,
      labels: `EDIT-ISSUE-${generateId()}`,
      component: 'No component',
      estimation: '8',
      milestone: 'Milestone',
      duedate: 'today'
    }

    const leftSideMenuPage = new LeftSideMenuPage(page)
    await leftSideMenuPage.buttonTracker.click()

    const issuesPage = new IssuesPage(page)
    await issuesPage.modelSelectorAll.click()
    await issuesPage.createNewIssue(newIssue)
    await issuesPage.searchIssueByName(newIssue.title)
    await issuesPage.openIssueByName(newIssue.title)

    const issuesDetailsPage = new IssuesDetailsPage(page)
    await issuesDetailsPage.editIssue(editIssue)

    await issuesDetailsPage.checkIssue({
      ...newIssue,
      ...editIssue,
      estimation: '1d'
    })

    const estimations = new Map([
      ['0', '0h'],
      ['1', '1h'],
      ['1.25', '1h 15m'],
      ['1.259', '1h 15m'],
      ['1.26', '1h 15m'],
      ['1.27', '1h 16m'],
      ['1.5', '1h 30m'],
      ['1.75', '1h 45m'],
      ['2', '2h'],
      ['7', '7h'],
      ['8', '1d'],
      ['9', '1d 1h'],
      ['9.5', '1d 1h 30m']
    ])

    for (const [input, expected] of estimations.entries()) {
      await issuesDetailsPage.editIssue({
        estimation: input
      })
      await issuesDetailsPage.checkIssue({
        ...newIssue,
        ...editIssue,
        estimation: expected
      })
    }
  })
})