import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

// Exercise real components with synthetic auth/read boundaries; no network or auth/RLS proof.
function component(file, mocks = {}) {
  const states = [], refs = [], effects = [], dependencies = [], focused = []
  let cursor = 0
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
    },
    useRef(initial) {
      const index = cursor++
      return refs[index] ??= { current: initial }
    },
    useEffect(effect, deps) {
      const index = cursor++
      if (!dependencies[index] || !deps || deps.some((value, i) => value !== dependencies[index][i])) {
        dependencies[index] = deps
        effects.push(effect)
      }
    },
  }
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText
  new Function('require', 'module', 'exports', code)(
    name => name === 'react' ? hooks
      : name === 'next/link' ? { __esModule: true, default: 'a' }
      : name in mocks ? mocks[name] : require(name),
    module, module.exports,
  )
  const tree = () => {
    cursor = 0
    const result = module.exports.default()
    for (const node of descendants(result)) {
      if (node.props?.ref && typeof node.props.ref === 'object') {
        node.props.ref.current = { focus: () => focused.push(node.props.id) }
      }
    }
    effects.splice(0).forEach(effect => effect())
    return result
  }
  return {
    tree, focused, html: () => renderToStaticMarkup(tree()),
    async mount() {
      for (let i = 0; i < 5; i++) {
        tree()
        await new Promise(resolve => setImmediate(resolve))
      }
      return this.html()
    },
  }
}
function descendants(node) {
  if (!node || typeof node !== 'object') return []
  return [node, ...React.Children.toArray(node.props?.children).flatMap(descendants)]
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function logoutHeader() {
  const pending = [], navigation = []
  const auth = { signOut: () => { const operation = deferred(); pending.push(operation); return operation.promise } }
  const ui = component('components/layout/Header.tsx', {
    '@/contexts/SidebarContext': { useSidebar: () => ({ toggle() {} }) },
    '@/lib/supabase/client': { createClient: () => ({ auth }) },
    'next/navigation': { useRouter: () => ({ push: href => navigation.push(['push', href]), refresh: () => navigation.push(['refresh']) }) },
  })
  const button = () => descendants(ui.tree()).find(node => node.type === 'button' && node.props['aria-label'] !== 'Menu')
  return { ui, button, pending, navigation }
}

for (const failure of ['returned error', 'rejected promise']) {
  test('header waits for logout receipt and offers focused retry after ' + failure, async () => {
    const { ui, button, pending, navigation } = logoutHeader()
    const attempt = button().props.onClick()
    assert.equal(pending.length, 1)
    assert.deepEqual(navigation, [], 'pending sign-out must not navigate')
    assert.doesNotMatch(ui.html(), /sess\u00e3o encerrada/)

    if (failure === 'returned error') pending[0].resolve({ error: Error('synthetic provider failure') })
    else pending[0].reject(Error('synthetic transport failure'))
    await attempt
    assert.deepEqual(navigation, [], 'a failed receipt must not navigate')
    const html = ui.html()
    assert.match(html, /role="alert"/)
    assert.match(html, /N\u00e3o foi poss\u00edvel confirmar o encerramento da sess\u00e3o/)
    assert.doesNotMatch(html, /synthetic provider failure|synthetic transport failure/)
    assert.equal(ui.focused.at(-1), 'logout-error')
    assert.equal(button().props.disabled, false)
    assert.match(renderToStaticMarkup(button()), /Tentar sair novamente/)

    const retry = button().props.onClick()
    assert.equal(pending.length, 2)
    assert.deepEqual(navigation, [])
    assert.equal(button().props.disabled, true)
    assert.doesNotMatch(ui.html(), /role="alert"/)
    pending[1].resolve({ error: null })
    await retry
    assert.deepEqual(navigation, [['push', '/auth/login'], ['refresh']])
  })
}

test('header prevents concurrent requests and navigates only after a successful first logout receipt', async () => {
  const { ui, button, pending, navigation } = logoutHeader()
  const firstClick = button().props.onClick
  const attempt = firstClick()
  assert.deepEqual(navigation, [])
  assert.equal(button().props.disabled, true)
  assert.equal(button().props['aria-busy'], true)
  assert.match(ui.html(), /Encerrando/)
  await firstClick()
  assert.equal(pending.length, 1, 'duplicate clicks must not create concurrent sign-outs')
  pending[0].resolve({ error: null })
  await attempt
  assert.deepEqual(navigation, [['push', '/auth/login'], ['refresh']])
})

test('mobile navigation links only to existing pages and identifies unavailable Collabs', () => {
  const ui = component('components/layout/MobileNav.tsx', { 'next/navigation': { usePathname: () => '/dashboard' } })
  const nodes = descendants(ui.tree())
  const links = nodes.filter(node => node.type === 'a')
  assert.equal(links.length, 4)
  for (const link of links) assert.ok(fs.existsSync('app' + link.props.href + '/page.tsx'), 'missing page: ' + link.props.href)
  assert.equal(nodes.some(node => node.props?.href === '/dashboard/collabs'), false)
  const unavailable = nodes.find(node => node.props?.['aria-disabled'] === true && renderToStaticMarkup(node).includes('Collabs'))
  assert.ok(unavailable)
  assert.match(renderToStaticMarkup(unavailable), /Indispon\u00edvel nesta vers\u00e3o/)
  assert.ok(descendants(unavailable).some(node => node.type === 'span' && node.props.children === 'Indispon\u00edvel' && !node.props.className?.includes('sr-only')))
})

test('admin modules without routes are explicit unavailable cards without dead links', async () => {
  const client = {
    from() {
      const query = { select() { return query }, eq() { return query }, then(yes, no) { return Promise.resolve({ data: [], count: 0, error: null }).then(yes, no) } }
      return query
    },
  }
  const ui = component('app/admin/page.tsx', { '@/lib/supabase/client': { createClient: () => client } })
  const html = await ui.mount()
  assert.match(html, /Pipeline de Hot\u00e9is/)
  const nodes = descendants(ui.tree())
  assert.equal(nodes.some(node => ['/admin/hoteis', '/admin/financeiro'].includes(node.props?.href)), false)
  for (const label of ['Pipeline de Hot\u00e9is', 'Financeiro']) {
    const card = nodes.find(node => node.props?.['aria-disabled'] === true && renderToStaticMarkup(node).includes(label))
    assert.ok(card, label + ' must be unavailable')
    assert.match(renderToStaticMarkup(card), /Indispon\u00edvel nesta vers\u00e3o/)
  }
})

