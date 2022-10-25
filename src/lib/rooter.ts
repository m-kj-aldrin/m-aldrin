// 
const roots: { href: string, document: Document }[] = []

if (!roots.find(root => root.href === location.href)) {
    roots.push({
        href: location.href,
        document: document.cloneNode(true) as Document
    })
}


async function diff_styles(target_document: Document) {

    const target_links = [...target_document.querySelectorAll('link[rel="stylesheet"]')] as HTMLLinkElement[]
    const current_links = [...document.querySelectorAll('link[rel="stylesheet"]')] as HTMLLinkElement[]
    const filtered_links = target_links.filter(target_link => !current_links.some(current_link => target_link.href === current_link.href))

    const styles = await Promise.all(filtered_links.map(async link => ({
        content: await (fetch(link.href).then(res => res.text())),
        href: link.href
    })))

    styles.forEach(style => {
        const _style = document.createElement('style')
        _style.dataset.href = style.href
        _style.textContent = style.content
        document.head.appendChild(_style)
    })

    const target_styles = [...target_document.querySelectorAll('style')] as HTMLStyleElement[]
    const current_styles = [...document.querySelectorAll('style')] as HTMLStyleElement[]
    const filtered_styles = target_styles.filter(target_style => !current_styles.some(current_style => target_style.textContent === current_style.textContent))

    document.head.append(...filtered_styles)

    return true
}

async function diff_scripts(target_document: Document) {
    const targetScripts = [...target_document.querySelectorAll("script")];
    console.log(targetScripts)
    if (targetScripts.length) {
        targetScripts.forEach(script => script.src ? import(/* @vite-ignore */script.src) : null);
    }
}

async function transition(target: HTMLAnchorElement) {

    const { href, pathname } = target
    const destinationLinks = document.querySelectorAll(`[href=${CSS.escape(pathname)}]`)
    destinationLinks.forEach(l => l.classList.add('destination'))
    document.documentElement.classList.add('is-rooting')
    document.dispatchEvent(new CustomEvent('rooting', {
        detail: {
            root: location.pathname
        }
    }))

    let target_document: Document

    let _doc = roots.find(root => root.href === href)
    if (roots.some(root => root.href === href)) {
        // we allready know this root
        target_document = _doc.document.cloneNode(true) as Document

    } else {
        // else do the fetching
        // get the target document
        document.dispatchEvent(new Event('rooter:fetching-start'))
        document.documentElement.classList.add('is-fetching')

        const target_document_string = await fetch(href).then(res => res.text())
        target_document = new DOMParser().parseFromString(target_document_string, 'text/html')
        diff_scripts(target_document)
        await diff_styles(target_document)
        document.dispatchEvent(new Event('rooter:fetching-done'))
        document.documentElement.classList.remove('is-fetching')

        roots.push({ href, document: target_document.cloneNode(true) as Document })

    }

    // let end_out_elements = document.querySelectorAll('[class*="transitioner].end')
    let out_elements = document.querySelectorAll('[class*="transitioner"]')
    let out_animated_elements = [
        ...out_elements
    ].filter(el => !el.classList.contains('end')).map((el: HTMLElement) => {
        return new Promise<void>((resolve) => {
            el.addEventListener('transitionend', e => {
                if (e.target === el) {
                    resolve()
                }
            })
        })
    })
    let in_elements = target_document.querySelectorAll('[class*="transitioner"]')
    let in_animated_elements = [
        ...in_elements
    ].map((el: HTMLElement) => {
        return new Promise<void>((resolve) => {
            el.addEventListener('transitionend', e => {
                if (e.target === el) {
                    el.classList.remove('fade')
                    resolve()
                }
            })
        })
    })

    const sourceOrder = document.body.dataset.pageOrder
    const targetOrder = target_document.body.dataset.pageOrder
    let pageDirection = 0
    console.log(parseInt(sourceOrder), parseInt(targetOrder))
    if (parseInt(sourceOrder) == -1 || parseInt(targetOrder) == -1) {
    } else {

        if (sourceOrder < targetOrder) {
            pageDirection = 1
        } else if (sourceOrder > targetOrder) {
            pageDirection = -1
        }

    }
    document.body.dataset.pageOrder = targetOrder

    document.documentElement.style.setProperty(`--page-direction`, pageDirection.toString())


    // do the content transition
    document.documentElement.classList.add('is-animating-out')
    // wait for out the animations
    await Promise.all(out_animated_elements)
    // Handle the outro transitions
    const end_out_elements = [...out_elements].filter(el => el.classList.contains('end'))
    await Promise.all(end_out_elements.map(el => {
        el.classList.remove('end')
        return new Promise<void>(resolve => {
            el.addEventListener('transitionend', e => {
                if (el === e.target) {
                    resolve()
                }
            })
        })
    }))

    document.documentElement.classList.remove('is-animating-out')
    const source_element = document.body.querySelector('main')
    const source_parent = source_element.parentElement
    source_element.remove()

    document.dispatchEvent(new Event('navigating-done'))
    destinationLinks.forEach(l => l.classList.remove('destination'))
    // target.classList.remove('destination')

    document.documentElement.classList.add('is-animating')
    source_parent.appendChild(target_document.querySelector('main'))
    setTimeout(() => document.documentElement.classList.remove('is-animating'));

    await Promise.all(in_animated_elements)

    document.documentElement.classList.remove('is-rooting')
}

function handleClick(e: Event) {
    let target = e.composedPath()[0] as HTMLAnchorElement
    if (target.tagName === 'A') {
        e.preventDefault()
        if (target.pathname === location.pathname) {
            target.classList.add('error')
            target.ontransitionend = e => {
                if (e.target === target) {
                    target.classList.remove('error')
                    target.ontransitionend = null
                }
            }
            return
        }
        // target.classList.add('destination')
        history.pushState(null, null, target.href)
        transition(target)
    }

}
document.addEventListener('click', handleClick)

window.addEventListener('popstate', () => transition(location))

export { }