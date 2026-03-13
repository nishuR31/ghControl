import { Octokit } from '@octokit/rest'

export function getOctokit(token: string) {
  return new Octokit({ auth: token })
}

// ── User ───────────────────────────────────────────────────────────────────
export async function getUser(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.users.getAuthenticated()
  return data
}

// ── Repos ──────────────────────────────────────────────────────────────────
export async function listRepos(token: string, params?: {
  sort?: 'created'|'updated'|'pushed'|'full_name'
  type?: 'all'|'owner'|'public'|'private'|'member'
  per_page?: number; page?: number
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated', type: 'all', per_page: 100, ...params
  })
  return data
}

export async function getRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.get({ owner, repo })
  return data
}

export async function createRepo(token: string, params: {
  name: string; description?: string; private?: boolean; auto_init?: boolean
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.createForAuthenticatedUser(params)
  return data
}

export async function deleteRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  await octokit.repos.delete({ owner, repo })
}

export async function forkRepo(token: string, owner: string, repo: string, org?: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.createFork({ owner, repo, organization: org })
  return data
}

export async function updateRepo(token: string, owner: string, repo: string, params: object) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.update({ owner, repo, ...params } as any)
  return data
}

// ── Branches ───────────────────────────────────────────────────────────────
export async function listBranches(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.listBranches({ owner, repo, per_page: 100 })
  return data
}

export async function createBranch(token: string, owner: string, repo: string, branch: string, fromBranch: string) {
  const octokit = getOctokit(token)
  // get sha of source branch
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${fromBranch}` })
  const { data } = await octokit.git.createRef({
    owner, repo,
    ref: `refs/heads/${branch}`,
    sha: ref.object.sha
  })
  return data
}

export async function deleteBranch(token: string, owner: string, repo: string, branch: string) {
  const octokit = getOctokit(token)
  await octokit.git.deleteRef({ owner, repo, ref: `heads/${branch}` })
}

export async function getBranchProtection(token: string, owner: string, repo: string, branch: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.getBranchProtection({ owner, repo, branch })
  return data
}

// ── Commits ────────────────────────────────────────────────────────────────
export async function listCommits(token: string, owner: string, repo: string, params?: {
  sha?: string; path?: string; author?: string; per_page?: number; page?: number
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.listCommits({ owner, repo, per_page: 30, ...params })
  return data
}

export async function getCommit(token: string, owner: string, repo: string, ref: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.getCommit({ owner, repo, ref })
  return data
}

export async function compareCommits(token: string, owner: string, repo: string, base: string, head: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.compareCommitsWithBasehead({
    owner, repo, basehead: `${base}...${head}`
  })
  return data
}

// ── Issues ─────────────────────────────────────────────────────────────────
export async function listIssues(token: string, owner: string, repo: string, params?: {
  state?: 'open'|'closed'|'all'; labels?: string; per_page?: number; page?: number; assignee?: string
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.listForRepo({
    owner, repo, state: 'open', per_page: 30, ...params
  })
  return data.filter(i => !i.pull_request)
}

export async function getIssue(token: string, owner: string, repo: string, issue_number: number) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.get({ owner, repo, issue_number })
  return data
}

export async function createIssue(token: string, owner: string, repo: string, params: {
  title: string; body?: string; labels?: string[]; assignees?: string[]; milestone?: number
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.create({ owner, repo, ...params })
  return data
}

export async function updateIssue(token: string, owner: string, repo: string, issue_number: number, params: object) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.update({ owner, repo, issue_number, ...params } as any)
  return data
}

export async function addIssueComment(token: string, owner: string, repo: string, issue_number: number, body: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.createComment({ owner, repo, issue_number, body })
  return data
}

export async function listIssueComments(token: string, owner: string, repo: string, issue_number: number) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.listComments({ owner, repo, issue_number })
  return data
}

// ── Labels ─────────────────────────────────────────────────────────────────
export async function listLabels(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.listLabelsForRepo({ owner, repo, per_page: 100 })
  return data
}

export async function createLabel(token: string, owner: string, repo: string, name: string, color: string, description?: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.createLabel({ owner, repo, name, color, description })
  return data
}

// ── Milestones ─────────────────────────────────────────────────────────────
export async function listMilestones(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.issues.listMilestones({ owner, repo })
  return data
}

// ── Pull Requests ──────────────────────────────────────────────────────────
export async function listPulls(token: string, owner: string, repo: string, params?: {
  state?: 'open'|'closed'|'all'; base?: string; per_page?: number; page?: number
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.list({ owner, repo, state: 'open', per_page: 30, ...params })
  return data
}

export async function getPull(token: string, owner: string, repo: string, pull_number: number) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.get({ owner, repo, pull_number })
  return data
}

export async function createPull(token: string, owner: string, repo: string, params: {
  title: string; head: string; base: string; body?: string; draft?: boolean
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.create({ owner, repo, ...params })
  return data
}

export async function mergePull(token: string, owner: string, repo: string, pull_number: number, params?: {
  commit_title?: string; commit_message?: string; merge_method?: 'merge'|'squash'|'rebase'
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.merge({ owner, repo, pull_number, ...params })
  return data
}

export async function listPullReviews(token: string, owner: string, repo: string, pull_number: number) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.listReviews({ owner, repo, pull_number })
  return data
}

export async function createReviewComment(token: string, owner: string, repo: string, pull_number: number, body: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.pulls.createReview({ owner, repo, pull_number, body, event: 'COMMENT' })
  return data
}

// ── Releases ───────────────────────────────────────────────────────────────
export async function listReleases(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.listReleases({ owner, repo, per_page: 20 })
  return data
}

export async function createRelease(token: string, owner: string, repo: string, params: {
  tag_name: string; name?: string; body?: string; draft?: boolean; prerelease?: boolean; target_commitish?: string
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.createRelease({ owner, repo, ...params })
  return data
}

export async function deleteRelease(token: string, owner: string, repo: string, release_id: number) {
  const octokit = getOctokit(token)
  await octokit.repos.deleteRelease({ owner, repo, release_id })
}

// ── Actions / Workflows ────────────────────────────────────────────────────
export async function listWorkflows(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.actions.listRepoWorkflows({ owner, repo })
  return data
}

export async function listWorkflowRuns(token: string, owner: string, repo: string, workflow_id?: number | string) {
  const octokit = getOctokit(token)
  if (workflow_id) {
    const { data } = await octokit.actions.listWorkflowRuns({ owner, repo, workflow_id, per_page: 20 } as any)
    return data
  }
  const { data } = await octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 20 })
  return data
}

export async function triggerWorkflow(token: string, owner: string, repo: string, workflow_id: string, ref: string, inputs?: object) {
  const octokit = getOctokit(token)
  await octokit.actions.createWorkflowDispatch({ owner, repo, workflow_id, ref, inputs: inputs as any })
}

export async function cancelWorkflowRun(token: string, owner: string, repo: string, run_id: number) {
  const octokit = getOctokit(token)
  await octokit.actions.cancelWorkflowRun({ owner, repo, run_id })
}

export async function rerunWorkflow(token: string, owner: string, repo: string, run_id: number) {
  const octokit = getOctokit(token)
  await octokit.actions.reRunWorkflow({ owner, repo, run_id })
}

// ── Webhooks ───────────────────────────────────────────────────────────────
export async function listHooks(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.listWebhooks({ owner, repo })
  return data
}

export async function createHook(token: string, owner: string, repo: string, url: string, events: string[], secret?: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.createWebhook({
    owner, repo,
    name: 'web', active: true, events,
    config: { url, content_type: 'json', secret, insecure_ssl: '0' }
  })
  return data
}

export async function deleteHook(token: string, owner: string, repo: string, hook_id: number) {
  const octokit = getOctokit(token)
  await octokit.repos.deleteWebhook({ owner, repo, hook_id })
}

export async function pingHook(token: string, owner: string, repo: string, hook_id: number) {
  const octokit = getOctokit(token)
  await octokit.repos.pingWebhook({ owner, repo, hook_id })
}

// ── Stars / Watch ──────────────────────────────────────────────────────────
export async function starRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  await octokit.activity.starRepoForAuthenticatedUser({ owner, repo })
}

export async function unstarRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  await octokit.activity.unstarRepoForAuthenticatedUser({ owner, repo })
}

export async function listStarred(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.activity.listReposStarredByAuthenticatedUser({ per_page: 50 })
  return data
}

export async function watchRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  await octokit.activity.setRepoSubscription({ owner, repo, subscribed: true })
}

// ── Search ─────────────────────────────────────────────────────────────────
export async function searchRepos(token: string, q: string, sort?: 'stars'|'forks'|'updated') {
  const octokit = getOctokit(token)
  const { data } = await octokit.search.repos({ q, sort, per_page: 30 })
  return data
}

export async function searchCode(token: string, q: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.search.code({ q, per_page: 30 })
  return data
}

export async function searchIssues(token: string, q: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.search.issuesAndPullRequests({ q, per_page: 30 })
  return data
}

export async function searchUsers(token: string, q: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.search.users({ q, per_page: 20 })
  return data
}

// ── Gists ──────────────────────────────────────────────────────────────────
export async function listGists(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.gists.list({ per_page: 30 })
  return data
}

export async function createGist(token: string, description: string, files: Record<string, { content: string }>, isPublic = false) {
  const octokit = getOctokit(token)
  const { data } = await octokit.gists.create({ description, files, public: isPublic })
  return data
}

// ── SSH Keys ───────────────────────────────────────────────────────────────
export async function listSSHKeys(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.users.listPublicSshKeysForAuthenticated()
  return data
}

export async function addSSHKey(token: string, title: string, key: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.users.createPublicSshKeyForAuthenticated({ title, key })
  return data
}

// ── Contents / Files ───────────────────────────────────────────────────────
export async function getFileContent(token: string, owner: string, repo: string, path: string, ref?: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref } as any)
  return data
}

export async function createOrUpdateFile(token: string, owner: string, repo: string, path: string, params: {
  message: string; content: string; sha?: string; branch?: string
}) {
  const octokit = getOctokit(token)
  const { data } = await octokit.repos.createOrUpdateFileContents({ owner, repo, path, ...params })
  return data
}

// ── Notifications ──────────────────────────────────────────────────────────
export async function listNotifications(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.activity.listNotificationsForAuthenticatedUser({ per_page: 30 })
  return data
}

export async function markNotificationsRead(token: string) {
  const octokit = getOctokit(token)
  await octokit.activity.markNotificationsAsRead()
}

// ── Rate Limit ─────────────────────────────────────────────────────────────
export async function getRateLimit(token: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.rateLimit.get()
  return data
}
