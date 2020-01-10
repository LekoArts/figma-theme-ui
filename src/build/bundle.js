
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var ui = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css = ":root{--blue:#18a0fb;--purple:#7b61ff;--hot-pink:#f0f;--green:#1bc47d;--red:#f24822;--yellow:#ffeb00;--black:#000;--black8:rgba(0,0,0,0.8);--black8-opaque:#333;--black3:rgba(0,0,0,0.3);--black3-opaque:#b3b3b3;--white:#fff;--white8:hsla(0,0%,100%,0.8);--white4:hsla(0,0%,100%,0.4);--grey:#f0f0f0;--silver:#e5e5e5;--hud:#222;--toolbar:#2c2c2c;--black1:rgba(0,0,0,0.1);--blue3:rgba(24,145,251,0.3);--purple4:rgba(123,97,255,0.4);--hover-fill:rgba(0,0,0,0.06);--selection-a:#daebf7;--selection-b:#edf5fa;--white2:hsla(0,0%,100%,0.2);--font-stack:\"Inter\",sans-serif;--font-size-xsmall:11px;--font-size-small:12px;--font-size-large:13px;--font-size-xlarge:14px;--font-weight-normal:400;--font-weight-medium:500;--font-weight-bold:600;--font-line-height:16px;--font-line-height-large:24px;--font-letter-spacing-pos-xsmall:.005em;--font-letter-spacing-neg-xsmall:.01em;--font-letter-spacing-pos-small:0;--font-letter-spacing-neg-small:.005em;--font-letter-spacing-pos-large:-.0025em;--font-letter-spacing-neg-large:.0025em;--font-letter-spacing-pos-xlarge:-.001em;--font-letter-spacing-neg-xlarge:-.001em;--border-radius-small:2px;--border-radius-med:5px;--border-radius-large:6px;--shadow-hud:0 5px 17px rgba(0,0,0,0.2),0 2px 7px rgba(0,0,0,0.15);--shadow-floating-window:0 2px 14px rgba(0,0,0,0.15);--size-xxsmall:8px;--size-xsmall:16px;--size-small:24px;--size-medium:32px;--size-large:40px;--size-xlarge:48px;--size-xxlarge:64px;--size-huge:80px}*,body{box-sizing:border-box}body{position:relative;font-family:Inter,sans-serif;margin:0;padding:0}@font-face{font-family:Inter;font-weight:400;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:500;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:600;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff\")}a{text-decoration:none;cursor:pointer}a,a:active,a:hover{color:var(--blue)}a:focus{text-decoration:underline}.p-xxsmall{padding:var(--size-xxsmall)}.p-xsmall{padding:var(--size-xsmall)}.p-small{padding:var(--size-small)}.p-medium{padding:var(--size-medium)}.p-large{padding:var(--size-large)}.p-xlarge{padding:var(--size-xlarge)}.p-xxlarge{padding:var(--size-xxlarge)}.p-huge{padding:var(--size-huge)}.pt-xxsmall{padding-top:var(--size-xxsmall)}.pt-xsmall{padding-top:var(--size-xsmall)}.pt-small{padding-top:var(--size-small)}.pt-medium{padding-top:var(--size-medium)}.pt-large{padding-top:var(--size-large)}.pt-xlarge{padding-top:var(--size-xlarge)}.pt-xxlarge{padding-top:var(--size-xxlarge)}.pt-huge{padding-top:var(--size-huge)}.pr-xxsmall{padding-right:var(--size-xxsmall)}.pr-xsmall{padding-right:var(--size-xsmall)}.pr-small{padding-right:var(--size-small)}.pr-medium{padding-right:var(--size-medium)}.pr-large{padding-right:var(--size-large)}.pr-xlarge{padding-right:var(--size-xlarge)}.pr-xxlarge{padding-right:var(--size-xxlarge)}.pr-huge{padding-right:var(--size-huge)}.pb-xxsmall{padding-bottom:var(--size-xxsmall)}.pb-xsmall{padding-bottom:var(--size-xsmall)}.pb-small{padding-bottom:var(--size-small)}.pb-medium{padding-bottom:var(--size-medium)}.pb-large{padding-bottom:var(--size-large)}.pb-xlarge{padding-bottom:var(--size-xlarge)}.pb-xxlarge{padding-bottom:var(--size-xxlarge)}.pb-huge{padding-bottom:var(--size-huge)}.pl-xxsmall{padding-left:var(--size-xxsmall)}.pl-xsmall{padding-left:var(--size-xsmall)}.pl-small{padding-left:var(--size-small)}.pl-medium{padding-left:var(--size-medium)}.pl-large{padding-left:var(--size-large)}.pl-xlarge{padding-left:var(--size-xlarge)}.pl-xxlarge{padding-left:var(--size-xxlarge)}.pl-huge{padding-left:var(--size-huge)}.m-xxsmall{margin:var(--size-xxsmall)}.m-xsmall{margin:var(--size-xsmall)}.m-small{margin:var(--size-small)}.m-medium{margin:var(--size-medium)}.m-large{margin:var(--size-large)}.m-xlarge{margin:var(--size-xlarge)}.m-xxlarge{margin:var(--size-xxlarge)}.m-huge{margin:var(--size-huge)}.mt-xxsmall{margin-top:var(--size-xxsmall)}.mt-xsmall{margin-top:var(--size-xsmall)}.mt-small{margin-top:var(--size-small)}.mt-medium{margin-top:var(--size-medium)}.mt-large{margin-top:var(--size-large)}.mt-xlarge{margin-top:var(--size-xlarge)}.mt-xxlarge{margin-top:var(--size-xxlarge)}.mt-huge{margin-top:var(--size-huge)}.mr-xxsmall{margin-right:var(--size-xxsmall)}.mr-xsmall{margin-right:var(--size-xsmall)}.mr-small{margin-right:var(--size-small)}.mr-medium{margin-right:var(--size-medium)}.mr-large{margin-right:var(--size-large)}.mr-xlarge{margin-right:var(--size-xlarge)}.mr-xxlarge{margin-right:var(--size-xxlarge)}.mr-huge{margin-right:var(--size-huge)}.mb-xxsmall{margin-bottom:var(--size-xxsmall)}.mb-xsmall{margin-bottom:var(--size-xsmall)}.mb-small{margin-bottom:var(--size-small)}.mb-medium{margin-bottom:var(--size-medium)}.mb-large{margin-bottom:var(--size-large)}.mb-xlarge{margin-bottom:var(--size-xlarge)}.mb-xxlarge{margin-bottom:var(--size-xxlarge)}.mb-huge{margin-bottom:var(--size-huge)}.ml-xxsmall{margin-left:var(--size-xxsmall)}.ml-xsmall{margin-left:var(--size-xsmall)}.ml-small{margin-left:var(--size-small)}.ml-medium{margin-left:var(--size-medium)}.ml-large{margin-left:var(--size-large)}.ml-xlarge{margin-left:var(--size-xlarge)}.ml-xxlarge{margin-left:var(--size-xxlarge)}.ml-huge{margin-left:var(--size-huge)}.hidden{display:none}.flex{display:flex}.flexwrap{flex-wrap:wrap}.column{flex-direction:column}.row{flex-direction:row}";
    styleInject(css);

    /* node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte generated by Svelte v3.16.7 */
    const file = "node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-8intfl-style";
    	style.textContent = "button.svelte-8intfl{display:flex;align-items:center;border-radius:var(--border-radius-large);color:var(--white);flex-shrink:0;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-medium);letter-spacing:var(--font-letter-spacing-neg-small);line-height:var(--font-line-height);height:var(--size-medium);padding:0 var(--size-xsmall) 0 var(--size-xsmall);text-decoration:none;outline:none;border:2px solid transparent;user-select:none}.primary.svelte-8intfl{background-color:var(--blue);color:var(--white)}.primary.svelte-8intfl:enabled:active,.primary.svelte-8intfl:enabled:focus{border:2px solid var(--black3)}.primary.svelte-8intfl:disabled{background-color:var(--black3)}.primary.destructive.svelte-8intfl{background-color:var(--red)}.primary.destructive.svelte-8intfl:disabled{opacity:0.4}.secondary.svelte-8intfl{background-color:var(--white);border:1px solid var(--black8);color:var(--black8);padding:0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px);letter-spacing:var(--font-letter-spacing-pos-small)}.secondary.svelte-8intfl:enabled:active,.secondary.svelte-8intfl:enabled:focus{border:2px solid var(--blue);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.svelte-8intfl:disabled{border:1px solid var(--black3);color:var(--black3)}.secondary.destructive.svelte-8intfl{border-color:var(--red);color:var(--red)}.secondary.destructive.svelte-8intfl:enabled:active,.secondary.destructive.svelte-8intfl:enabled:focus{border:2px solid var(--red);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.destructive.svelte-8intfl:disabled{opacity:0.4}.tertiary.svelte-8intfl{border:1px solid transparent;color:var(--blue);padding:0;font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-small);cursor:pointer}.tertiary.svelte-8intfl:enabled:focus{text-decoration:underline}.tertiary.svelte-8intfl:disabled{color:var(--black3)}.tertiary.destructive.svelte-8intfl{color:var(--red)}.tertiary.destructive.svelte-8intfl:enabled:focus{text-decoration:underline}.tertiary.destructive.svelte-8intfl:disabled{opacity:0.4}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcblxuICAgIGV4cG9ydCBsZXQgdmFyaWFudCA9ICdwcmltYXJ5JztcbiAgICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgZXhwb3J0IGxldCBkZXN0cnVjdGl2ZSA9IGZhbHNlO1xuICAgIGV4cG9ydCB7IGNsYXNzTmFtZSBhcyBjbGFzcyB9O1xuXG4gICAgbGV0IGNsYXNzTmFtZSA9ICcnO1xuXG48L3NjcmlwdD5cblxuPGJ1dHRvblxuICAgIG9uOmNsaWNrXG4gICAgb246c3VibWl0fHByZXZlbnREZWZhdWx0XG4gICAgb25jbGljaz1cInRoaXMuYmx1cigpO1wiXG4gICAge3ZhcmlhbnR9XG4gICAge2Rpc2FibGVkfVxuICAgIGNsYXNzOmRlc3RydWN0aXZlPXtkZXN0cnVjdGl2ZX1cbiAgICBjbGFzcz1cInt2YXJpYW50fSB7Y2xhc3NOYW1lfVwiPlxuICAgICAgICA8c2xvdCAvPlxuPC9idXR0b24+XG5cbjxzdHlsZT5cblxuICAgIGJ1dHRvbiB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtbGFyZ2UpO1xuICAgICAgICBjb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBmbGV4LXNocmluazogMDtcbiAgICAgICAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtc3RhY2spO1xuICAgICAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14c21hbGwpO1xuICAgICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbWVkaXVtKTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhcigtLWZvbnQtbGV0dGVyLXNwYWNpbmctbmVnLXNtYWxsKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtbGluZS1oZWlnaHQpO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgIH1cblxuICAgIC8qIFByaW1hcnkgc3R5bGVzICovXG4gICAgLnByaW1hcnkge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ibHVlKTtcbiAgICAgICAgY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICB9XG4gICAgLnByaW1hcnk6ZW5hYmxlZDphY3RpdmUsIC5wcmltYXJ5OmVuYWJsZWQ6Zm9jdXMge1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAucHJpbWFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIC5wcmltYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcmVkKTtcbiAgICB9XG4gICAgLnByaW1hcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQgIHtcbiAgICAgICAgb3BhY2l0eTogMC40O1xuICAgIH1cblxuICAgIC8qIFNlY29uZGFyeSBzdHlsZXMgKi9cbiAgICAuc2Vjb25kYXJ5IHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ibGFjazgpO1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2s4KTtcbiAgICAgICAgcGFkZGluZzogMCBjYWxjKHZhcigtLXNpemUteHNtYWxsKSArIDFweCkgMCBjYWxjKHZhcigtLXNpemUteHNtYWxsKSArIDFweCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLXBvcy1zbWFsbCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnk6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnk6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWJsdWUpO1xuICAgICAgICBwYWRkaW5nOiAwIHZhcigtLXNpemUteHNtYWxsKSAwIHZhcigtLXNpemUteHNtYWxsKTtcbiAgICB9XG4gICAgLnNlY29uZGFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMyk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAuc2Vjb25kYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXJlZCk7XG4gICAgICAgY29sb3I6IHZhcigtLXJlZCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tcmVkKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQge1xuICAgICAgICBvcGFjaXR5OiAwLjQ7XG4gICAgfVxuXG4gICAgLyogdGVydGlhcnkgc3R5bGVzICovXG4gICAgLnRlcnRpYXJ5IHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibHVlKTtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IHZhcigtLWZvbnQtd2VpZ2h0LW5vcm1hbCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLXBvcy1zbWFsbCk7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG4gICAgLnRlcnRpYXJ5OmVuYWJsZWQ6Zm9jdXMge1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICB9XG4gICAgLnRlcnRpYXJ5OmRpc2FibGVkIHtcbiAgICAgICAgY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZSB7XG4gICAgICAgY29sb3I6IHZhcigtLXJlZCk7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZTplbmFibGVkOmZvY3VzIHtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZTpkaXNhYmxlZCB7XG4gICAgICAgb3BhY2l0eTogMC40O1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeUJJLE1BQU0sY0FBQyxDQUFDLEFBQ0osT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixhQUFhLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxDQUN6QyxLQUFLLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FDbkIsV0FBVyxDQUFFLENBQUMsQ0FDZCxXQUFXLENBQUUsSUFBSSxZQUFZLENBQUMsQ0FDOUIsU0FBUyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDbEMsV0FBVyxDQUFFLElBQUksb0JBQW9CLENBQUMsQ0FDdEMsY0FBYyxDQUFFLElBQUksK0JBQStCLENBQUMsQ0FDcEQsV0FBVyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDcEMsTUFBTSxDQUFFLElBQUksYUFBYSxDQUFDLENBQzFCLE9BQU8sQ0FBRSxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FDbEQsZUFBZSxDQUFFLElBQUksQ0FDckIsT0FBTyxDQUFFLElBQUksQ0FDYixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzdCLFdBQVcsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFHRCxRQUFRLGNBQUMsQ0FBQyxBQUNOLGdCQUFnQixDQUFFLElBQUksTUFBTSxDQUFDLENBQzdCLEtBQUssQ0FBRSxJQUFJLE9BQU8sQ0FBQyxBQUN2QixDQUFDLEFBQ0Qsc0JBQVEsUUFBUSxPQUFPLENBQUUsc0JBQVEsUUFBUSxNQUFNLEFBQUMsQ0FBQyxBQUM3QyxNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxBQUNuQyxDQUFDLEFBQ0Qsc0JBQVEsU0FBUyxBQUFDLENBQUMsQUFDZixnQkFBZ0IsQ0FBRSxJQUFJLFFBQVEsQ0FBQyxBQUNuQyxDQUFDLEFBQ0QsUUFBUSxZQUFZLGNBQUMsQ0FBQyxBQUNsQixnQkFBZ0IsQ0FBRSxJQUFJLEtBQUssQ0FBQyxBQUNoQyxDQUFDLEFBQ0QsUUFBUSwwQkFBWSxTQUFTLEFBQUUsQ0FBQyxBQUM1QixPQUFPLENBQUUsR0FBRyxBQUNoQixDQUFDLEFBR0QsVUFBVSxjQUFDLENBQUMsQUFDUixnQkFBZ0IsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUM5QixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUMvQixLQUFLLENBQUUsSUFBSSxRQUFRLENBQUMsQ0FDcEIsT0FBTyxDQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUMxRSxjQUFjLENBQUUsSUFBSSwrQkFBK0IsQ0FBQyxBQUN4RCxDQUFDLEFBQ0Qsd0JBQVUsUUFBUSxPQUFPLENBQUUsd0JBQVUsUUFBUSxNQUFNLEFBQUMsQ0FBQyxBQUNqRCxNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUM3QixPQUFPLENBQUUsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLEFBQ3RELENBQUMsQUFDRCx3QkFBVSxTQUFTLEFBQUMsQ0FBQyxBQUNqQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUMvQixLQUFLLENBQUUsSUFBSSxRQUFRLENBQUMsQUFDeEIsQ0FBQyxBQUNELFVBQVUsWUFBWSxjQUFDLENBQUMsQUFDckIsWUFBWSxDQUFFLElBQUksS0FBSyxDQUFDLENBQ3hCLEtBQUssQ0FBRSxJQUFJLEtBQUssQ0FBQyxBQUNwQixDQUFDLEFBQ0QsVUFBVSwwQkFBWSxRQUFRLE9BQU8sQ0FBRSxVQUFVLDBCQUFZLFFBQVEsTUFBTSxBQUFDLENBQUMsQUFDMUUsTUFBTSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FDM0IsT0FBTyxDQUFFLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxBQUN0RCxDQUFDLEFBQ0QsVUFBVSwwQkFBWSxTQUFTLEFBQUMsQ0FBQyxBQUM3QixPQUFPLENBQUUsR0FBRyxBQUNoQixDQUFDLEFBR0QsU0FBUyxjQUFDLENBQUMsQUFDUCxNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzdCLEtBQUssQ0FBRSxJQUFJLE1BQU0sQ0FBQyxDQUNsQixPQUFPLENBQUUsQ0FBQyxDQUNWLFdBQVcsQ0FBRSxJQUFJLG9CQUFvQixDQUFDLENBQ3RDLGNBQWMsQ0FBRSxJQUFJLCtCQUErQixDQUFDLENBQ3BELE1BQU0sQ0FBRSxPQUFPLEFBQ25CLENBQUMsQUFDRCx1QkFBUyxRQUFRLE1BQU0sQUFBQyxDQUFDLEFBQ3JCLGVBQWUsQ0FBRSxTQUFTLEFBQzlCLENBQUMsQUFDRCx1QkFBUyxTQUFTLEFBQUMsQ0FBQyxBQUNoQixLQUFLLENBQUUsSUFBSSxRQUFRLENBQUMsQUFDeEIsQ0FBQyxBQUNELFNBQVMsWUFBWSxjQUFDLENBQUMsQUFDcEIsS0FBSyxDQUFFLElBQUksS0FBSyxDQUFDLEFBQ3BCLENBQUMsQUFDRCxTQUFTLDBCQUFZLFFBQVEsTUFBTSxBQUFDLENBQUMsQUFDakMsZUFBZSxDQUFFLFNBQVMsQUFDOUIsQ0FBQyxBQUNELFNBQVMsMEJBQVksU0FBUyxBQUFDLENBQUMsQUFDN0IsT0FBTyxDQUFFLEdBQUcsQUFDZixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "onclick", "this.blur();");
    			attr_dev(button, "variant", /*variant*/ ctx[0]);
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "class", button_class_value = "" + (/*variant*/ ctx[0] + " " + /*className*/ ctx[3] + " svelte-8intfl"));
    			toggle_class(button, "destructive", /*destructive*/ ctx[2]);
    			add_location(button, file, 12, 0, 225);

    			dispose = [
    				listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false),
    				listen_dev(button, "submit", prevent_default(/*submit_handler*/ ctx[7]), false, true, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (!current || dirty & /*variant*/ 1) {
    				attr_dev(button, "variant", /*variant*/ ctx[0]);
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty & /*variant, className*/ 9 && button_class_value !== (button_class_value = "" + (/*variant*/ ctx[0] + " " + /*className*/ ctx[3] + " svelte-8intfl"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*variant, className, destructive*/ 13) {
    				toggle_class(button, "destructive", /*destructive*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { variant = "primary" } = $$props;
    	let { disabled = false } = $$props;
    	let { destructive = false } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ["variant", "disabled", "destructive", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(2, destructive = $$props.destructive);
    		if ("class" in $$props) $$invalidate(3, className = $$props.class);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			variant,
    			disabled,
    			destructive,
    			className
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(2, destructive = $$props.destructive);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    	};

    	return [
    		variant,
    		disabled,
    		destructive,
    		className,
    		$$scope,
    		$$slots,
    		click_handler,
    		submit_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-8intfl-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			variant: 0,
    			disabled: 1,
    			destructive: 2,
    			class: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destructive() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destructive(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte generated by Svelte v3.16.7 */

    const file$1 = "node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1fwferi-style";
    	style.textContent = ".icon-component.svelte-1fwferi{display:flex;align-items:center;justify-content:center;cursor:default;width:var(--size-medium);height:var(--size-medium);font-family:var(--font-stack);font-size:var(--font-size-xsmall);user-select:none}.spin.svelte-1fwferi{animation:svelte-1fwferi-rotating 1.0s linear infinite}@keyframes svelte-1fwferi-rotating{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.icon-component *{fill:inherit;color:inherit}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBleHBvcnQgbGV0IGljb25OYW1lID0gbnVsbDsgLy9wYXNzIHN2ZyBkYXRhIGludG8gdGhpcyB2YXIgYnkgaW1wb3J0aW5nIGFuIHN2ZyBpbiBwYXJlbnRcbiAgICBleHBvcnQgbGV0IHNwaW4gPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IGljb25UZXh0ID0gbnVsbDtcbiAgICBleHBvcnQgbGV0IGNvbG9yID0gXCJibGFjazhcIjtcbiAgICBleHBvcnQgeyBjbGFzc05hbWUgYXMgY2xhc3MgfTtcblxuICAgIGxldCBjbGFzc05hbWUgPSAnJztcbjwvc2NyaXB0PlxuXG48ZGl2IFxuICAgIGNsYXNzOnNwaW49e3NwaW59XG4gICAge2ljb25UZXh0fVxuICAgIHtpY29uTmFtZX0gXG4gICAgY2xhc3M9XCJpY29uLWNvbXBvbmVudCB7Y2xhc3NOYW1lfVwiXG4gICAgc3R5bGU9XCJjb2xvcjogdmFyKC0te2NvbG9yfSk7IGZpbGw6IHZhcigtLXtjb2xvcn0pXCI+XG4gICAgeyNpZiBpY29uVGV4dH1cbiAgICAgICAge2ljb25UZXh0fVxuICAgIHs6ZWxzZX1cbiAgICAgICAge0BodG1sIGljb25OYW1lfVxuICAgIHsvaWZ9XG48L2Rpdj5cblxuPHN0eWxlPlxuXG4gICAgLmljb24tY29tcG9uZW50IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICAgICAgd2lkdGg6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXN0YWNrKTtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteHNtYWxsKTtcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgfVxuXG4gICAgLnNwaW4ge1xuICAgICAgICBhbmltYXRpb246IHJvdGF0aW5nIDEuMHMgbGluZWFyIGluZmluaXRlO1xuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcm90YXRpbmcge1xuICAgICAgICBmcm9tIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICB9XG4gICAgICAgIHRvIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICA6Z2xvYmFsKC5pY29uLWNvbXBvbmVudCAqKSB7XG4gICAgICAgIGZpbGw6IGluaGVyaXQ7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeUJJLGVBQWUsZUFBQyxDQUFDLEFBQ2IsT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixlQUFlLENBQUUsTUFBTSxDQUN2QixNQUFNLENBQUUsT0FBTyxDQUNmLEtBQUssQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUN6QixNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDMUIsV0FBVyxDQUFFLElBQUksWUFBWSxDQUFDLENBQzlCLFNBQVMsQ0FBRSxJQUFJLGtCQUFrQixDQUFDLENBQ2xDLFdBQVcsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFFRCxLQUFLLGVBQUMsQ0FBQyxBQUNILFNBQVMsQ0FBRSx1QkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxBQUM1QyxDQUFDLEFBRUQsV0FBVyx1QkFBUyxDQUFDLEFBQ2pCLElBQUksQUFBQyxDQUFDLEFBQ0YsU0FBUyxDQUFFLE9BQU8sSUFBSSxDQUFDLEFBQzNCLENBQUMsQUFDRCxFQUFFLEFBQUMsQ0FBQyxBQUNBLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxBQUM3QixDQUFDLEFBQ0wsQ0FBQyxBQUVPLGlCQUFpQixBQUFFLENBQUMsQUFDeEIsSUFBSSxDQUFFLE9BQU8sQ0FDYixLQUFLLENBQUUsT0FBTyxBQUNsQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (19:4) {:else}
    function create_else_block(ctx) {
    	let html_tag;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(/*iconName*/ ctx[0], null);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(target, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconName*/ 1) html_tag.p(/*iconName*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if iconText}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*iconText*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconText*/ 4) set_data_dev(t, /*iconText*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:4) {#if iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let div_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*iconText*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-1fwferi");
    			set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			toggle_class(div, "spin", /*spin*/ ctx[1]);
    			add_location(div, file$1, 10, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*iconText*/ 4) {
    				attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			}

    			if (dirty & /*iconName*/ 1) {
    				attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 16 && div_class_value !== (div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-1fwferi")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*className, spin*/ 18) {
    				toggle_class(div, "spin", /*spin*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { iconName = null } = $$props;
    	let { spin = false } = $$props;
    	let { iconText = null } = $$props;
    	let { color = "black8" } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ["iconName", "spin", "iconText", "color", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("iconName" in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(1, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("class" in $$props) $$invalidate(4, className = $$props.class);
    	};

    	$$self.$capture_state = () => {
    		return {
    			iconName,
    			spin,
    			iconText,
    			color,
    			className
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("iconName" in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(1, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("className" in $$props) $$invalidate(4, className = $$props.className);
    	};

    	return [iconName, spin, iconText, color, className];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1fwferi-style")) add_css$1();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			iconName: 0,
    			spin: 1,
    			iconText: 2,
    			color: 3,
    			class: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get iconName() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Type/index.svelte generated by Svelte v3.16.7 */
    const file$2 = "node_modules/figma-plugin-ds-svelte/src/components/Type/index.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1ozcew1-style";
    	style.textContent = ".type.svelte-1ozcew1{font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);line-height:var(--font-line-height);letter-spacing:var(--font-letter-spacing-pos-xsmall)}.small.svelte-1ozcew1{font-size:var(--font-size-small);letter-spacing:var(--font-letter-spacing-pos-small)}.large.svelte-1ozcew1{font-size:var(--font-size-large);line-height:var(--font-line-height-large);letter-spacing:var(--font-letter-spacing-pos-large)}.xlarge.svelte-1ozcew1{font-size:var(--font-size-xlarge);line-height:var(--font-line-height-large);letter-spacing:var(--font-letter-spacing-pos-xlarge)}.medium.svelte-1ozcew1{font-weight:var(--font-weight-medium)}.bold.svelte-1ozcew1{font-weight:var(--font-weight-bold)}.inverse.svelte-1ozcew1{letter-spacing:var(--font-letter-spacing-neg-xsmall)}.inverse.small.svelte-1ozcew1{letter-spacing:var(--font-letter-spacing-neg-small)}.inverse.large.svelte-1ozcew1{letter-spacing:var(--font-letter-spacing-neg-large)}.inverse.xlarge.svelte-1ozcew1{letter-spacing:var(--font-letter-spacing-neg-xlarge)}.inline.svelte-1ozcew1{display:inline-block}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcblxuICAgIGV4cG9ydCBsZXQgc2l6ZSA9ICd4c21hbGwnO1xuICAgIGV4cG9ydCBsZXQgd2VpZ2h0ID0gJ25vcm1hbCc7XG4gICAgZXhwb3J0IGxldCBpbnZlcnNlID0gZmFsc2U7IC8vdGhpcyBwcm9wIHVzZXMgZGlmZmVyZW50IGxldHRlcnNwYWNpbmcgdmFsdWVzIGZvciBpbnZlcnNlZCB0eXBlIChsaWdodCBvbiBkYXJrKVxuICAgIGV4cG9ydCBsZXQgY29sb3IgPSAnYmxhY2s4JztcbiAgICBleHBvcnQgbGV0IGlubGluZSA9IGZhbHNlO1xuICAgIFxuICAgIGxldCBjbGFzc05hbWUgPSAnJztcblxuICAgIG9uTW91bnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoY29sb3IgPSAnYmxhY2s4JyAmJiBpbnZlcnNlKSB7XG4gICAgICAgICAgICBjb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIH1cbiAgICB9KTtcblxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJ0eXBlIHtjbGFzc05hbWV9IHtzaXplfSB7d2VpZ2h0fVwiIGNsYXNzOmludmVyc2U9e2ludmVyc2V9IGNsYXNzOmlubGluZT17aW5saW5lfSBzdHlsZT1cImNvbG9yOiB2YXIoLS17Y29sb3J9KVwiPlxuICAgIDxzbG90Lz5cbjwvZGl2PlxuXG48c3R5bGU+XG5cbiAgICAudHlwZSB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXN0YWNrKTtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteHNtYWxsKTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IHZhcigtLWZvbnQtd2VpZ2h0LW5vcm1hbCk7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LWxpbmUtaGVpZ2h0KTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhcigtLWZvbnQtbGV0dGVyLXNwYWNpbmctcG9zLXhzbWFsbCk7XG4gICAgfVxuXG4gICAgLyogc2l6ZXMgKi9cbiAgICAuc21hbGwge1xuICAgICAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS1zbWFsbCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLXBvcy1zbWFsbCk7XG4gICAgfVxuICAgIC5sYXJnZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLWxhcmdlKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtbGluZS1oZWlnaHQtbGFyZ2UpO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZm9udC1sZXR0ZXItc3BhY2luZy1wb3MtbGFyZ2UpO1xuICAgIH1cbiAgICAueGxhcmdlIHtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteGxhcmdlKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtbGluZS1oZWlnaHQtbGFyZ2UpO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZm9udC1sZXR0ZXItc3BhY2luZy1wb3MteGxhcmdlKTtcbiAgICB9XG5cbiAgICAvKiB3ZWlnaHRzICovXG4gICAgLm1lZGl1bSB7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1tZWRpdW0pO1xuICAgIH1cbiAgICAuYm9sZCB7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ib2xkKTtcbiAgICB9XG5cbiAgICAvKiBsZXR0ZXIgc3BhY2luZyBhZGp1c3RtZW50cyBiYXNlZCBwb3MvbmVnIGFwcGxpY2F0aW9uICovXG4gICAgLmludmVyc2Uge1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZm9udC1sZXR0ZXItc3BhY2luZy1uZWcteHNtYWxsKTtcbiAgICB9XG4gICAgLmludmVyc2Uuc21hbGwge1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZm9udC1sZXR0ZXItc3BhY2luZy1uZWctc21hbGwpO1xuICAgIH1cbiAgICAuaW52ZXJzZS5sYXJnZSB7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLW5lZy1sYXJnZSk7XG4gICAgfVxuICAgIC5pbnZlcnNlLnhsYXJnZSB7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLW5lZy14bGFyZ2UpO1xuICAgIH1cblxuICAgIC5pbmxpbmUge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF5QkksS0FBSyxlQUFDLENBQUMsQUFDSCxXQUFXLENBQUUsSUFBSSxZQUFZLENBQUMsQ0FDOUIsU0FBUyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDbEMsV0FBVyxDQUFFLElBQUksb0JBQW9CLENBQUMsQ0FDdEMsV0FBVyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDcEMsY0FBYyxDQUFFLElBQUksZ0NBQWdDLENBQUMsQUFDekQsQ0FBQyxBQUdELE1BQU0sZUFBQyxDQUFDLEFBQ0osU0FBUyxDQUFFLElBQUksaUJBQWlCLENBQUMsQ0FDakMsY0FBYyxDQUFFLElBQUksK0JBQStCLENBQUMsQUFDeEQsQ0FBQyxBQUNELE1BQU0sZUFBQyxDQUFDLEFBQ0osU0FBUyxDQUFFLElBQUksaUJBQWlCLENBQUMsQ0FDakMsV0FBVyxDQUFFLElBQUksd0JBQXdCLENBQUMsQ0FDMUMsY0FBYyxDQUFFLElBQUksK0JBQStCLENBQUMsQUFDeEQsQ0FBQyxBQUNELE9BQU8sZUFBQyxDQUFDLEFBQ0wsU0FBUyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDbEMsV0FBVyxDQUFFLElBQUksd0JBQXdCLENBQUMsQ0FDMUMsY0FBYyxDQUFFLElBQUksZ0NBQWdDLENBQUMsQUFDekQsQ0FBQyxBQUdELE9BQU8sZUFBQyxDQUFDLEFBQ0wsV0FBVyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDMUMsQ0FBQyxBQUNELEtBQUssZUFBQyxDQUFDLEFBQ0gsV0FBVyxDQUFFLElBQUksa0JBQWtCLENBQUMsQUFDeEMsQ0FBQyxBQUdELFFBQVEsZUFBQyxDQUFDLEFBQ04sY0FBYyxDQUFFLElBQUksZ0NBQWdDLENBQUMsQUFDekQsQ0FBQyxBQUNELFFBQVEsTUFBTSxlQUFDLENBQUMsQUFDWixjQUFjLENBQUUsSUFBSSwrQkFBK0IsQ0FBQyxBQUN4RCxDQUFDLEFBQ0QsUUFBUSxNQUFNLGVBQUMsQ0FBQyxBQUNaLGNBQWMsQ0FBRSxJQUFJLCtCQUErQixDQUFDLEFBQ3hELENBQUMsQUFDRCxRQUFRLE9BQU8sZUFBQyxDQUFDLEFBQ2IsY0FBYyxDQUFFLElBQUksZ0NBQWdDLENBQUMsQUFDekQsQ0FBQyxBQUVELE9BQU8sZUFBQyxDQUFDLEFBQ0wsT0FBTyxDQUFFLFlBQVksQUFDekIsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function create_fragment$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "type " + /*className*/ ctx[5] + " " + /*size*/ ctx[1] + " " + /*weight*/ ctx[2] + " svelte-1ozcew1");
    			set_style(div, "color", "var(--" + /*color*/ ctx[0] + ")");
    			toggle_class(div, "inverse", /*inverse*/ ctx[3]);
    			toggle_class(div, "inline", /*inline*/ ctx[4]);
    			add_location(div, file$2, 19, 0, 450);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    			}

    			if (!current || dirty & /*size, weight*/ 6 && div_class_value !== (div_class_value = "type " + /*className*/ ctx[5] + " " + /*size*/ ctx[1] + " " + /*weight*/ ctx[2] + " svelte-1ozcew1")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(div, "color", "var(--" + /*color*/ ctx[0] + ")");
    			}

    			if (dirty & /*size, weight, inverse*/ 14) {
    				toggle_class(div, "inverse", /*inverse*/ ctx[3]);
    			}

    			if (dirty & /*size, weight, inline*/ 22) {
    				toggle_class(div, "inline", /*inline*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { size = "xsmall" } = $$props;
    	let { weight = "normal" } = $$props;
    	let { inverse = false } = $$props;
    	let { color = "black8" } = $$props;
    	let { inline = false } = $$props;
    	let className = "";

    	onMount(async () => {
    		if ($$invalidate(0, color =  inverse)) {
    			$$invalidate(0, color = "white");
    		}
    	});

    	const writable_props = ["size", "weight", "inverse", "color", "inline"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Type> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("weight" in $$props) $$invalidate(2, weight = $$props.weight);
    		if ("inverse" in $$props) $$invalidate(3, inverse = $$props.inverse);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("inline" in $$props) $$invalidate(4, inline = $$props.inline);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			size,
    			weight,
    			inverse,
    			color,
    			inline,
    			className
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("weight" in $$props) $$invalidate(2, weight = $$props.weight);
    		if ("inverse" in $$props) $$invalidate(3, inverse = $$props.inverse);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("inline" in $$props) $$invalidate(4, inline = $$props.inline);
    		if ("className" in $$props) $$invalidate(5, className = $$props.className);
    	};

    	return [color, size, weight, inverse, inline, className, $$scope, $$slots];
    }

    class Type extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1ozcew1-style")) add_css$2();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			size: 1,
    			weight: 2,
    			inverse: 3,
    			color: 0,
    			inline: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Type",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get size() {
    		throw new Error("<Type>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Type>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weight() {
    		throw new Error("<Type>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weight(value) {
    		throw new Error("<Type>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Type>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Type>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Type>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Type>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Type>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Type>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var IconTheme = "<svg fill=\"none\" height=\"32\" viewBox=\"0 0 32 32\" width=\"32\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"#000\"><path clip-rule=\"evenodd\" d=\"m13 10h-3v12h3zm-3-1c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1h3c.5523 0 1-.4477 1-1v-12c0-.55228-.4477-1-1-1z\" fill-rule=\"evenodd\"/><path d=\"m10.75 20.5c0-.4142.3358-.75.75-.75s.75.3358.75.75-.3358.75-.75.75-.75-.3358-.75-.75z\"/><path d=\"m22 18c.5523 0 1 .4477 1 1v3c0 .5523-.4477 1-1 1h-7v-1h7v-3h-7v-1z\"/><path d=\"m18.3848 17 2.7573-2.7574c.3906-.3905.3906-1.0236 0-1.4142l-2.1213-2.1213c-.3905-.3905-1.0237-.3905-1.4142 0l-2.6066 2.6066v1.4142l3.3137-3.3137 2.1213 2.1213-3.4644 3.4645z\"/></g></svg>";

    /* src/components/AddStyles.svelte generated by Svelte v3.16.7 */
    const file$3 = "src/components/AddStyles.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-rvpxj-style";
    	style.textContent = ".wrapper-styles.svelte-rvpxj{justify-content:center}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkU3R5bGVzLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQWRkU3R5bGVzLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiZmlnbWEtcGx1Z2luLWRzLXN2ZWx0ZVwiO1xuICBleHBvcnQgbGV0IGRpc2FibGVkID0gdHJ1ZTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIC53cmFwcGVyLXN0eWxlcyB7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9XCJtdC14c21hbGwgZmxleCB3cmFwcGVyLXN0eWxlc1wiPlxuICA8QnV0dG9uIG9uOmNsaWNrIHtkaXNhYmxlZH0+QWRkIFN0eWxlczwvQnV0dG9uPlxuPC9kaXY+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUUsZUFBZSxhQUFDLENBQUMsQUFDZixlQUFlLENBQUUsTUFBTSxBQUN6QixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (13:2) <Button on:click {disabled}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Styles");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:2) <Button on:click {disabled}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current;

    	const button = new Button({
    			props: {
    				disabled: /*disabled*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "mt-xsmall flex wrapper-styles svelte-rvpxj");
    			add_location(div, file$3, 11, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*disabled*/ 1) button_changes.disabled = /*disabled*/ ctx[0];

    			if (dirty & /*$$scope*/ 4) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { disabled = true } = $$props;
    	const writable_props = ["disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddStyles> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => {
    		return { disabled };
    	};

    	$$self.$inject_state = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	return [disabled, click_handler];
    }

    class AddStyles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-rvpxj-style")) add_css$3();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { disabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddStyles",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get disabled() {
    		throw new Error("<AddStyles>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<AddStyles>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FileInput.svelte generated by Svelte v3.16.7 */

    const { console: console_1 } = globals;
    const file$4 = "src/components/FileInput.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-xw3wmi-style";
    	style.textContent = "[type=\"file\"].svelte-xw3wmi.svelte-xw3wmi{border:0;clip:rect(0, 0, 0, 0);height:1px;overflow:hidden;padding:0;position:absolute !important;white-space:nowrap;width:1px}[type=\"file\"]+label.svelte-xw3wmi.svelte-xw3wmi{background-color:var(--black);border-radius:var(--border-radius-small);color:var(--white);cursor:pointer;display:inline-flex;font-size:var(--font-size-small);height:var(--size-medium);line-height:var(--size-medium);padding-left:var(--size-xsmall);padding-right:var(--size-xsmall);transition:background-color 0.3s}label.svelte-xw3wmi.svelte-xw3wmi{overflow:hidden;max-width:250px}label.svelte-xw3wmi span.svelte-xw3wmi{margin-right:var(--size-xxsmall);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}[type=\"file\"]:focus+label.svelte-xw3wmi.svelte-xw3wmi,[type=\"file\"]+label.svelte-xw3wmi.svelte-xw3wmi:hover{background-color:var(--purple)}[type=\"file\"]:focus+label.svelte-xw3wmi.svelte-xw3wmi{outline:1px dotted #000;outline:-webkit-focus-ring-color auto 5px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUlucHV0LnN2ZWx0ZSIsInNvdXJjZXMiOlsiRmlsZUlucHV0LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBCdXR0b24sIFR5cGUsIEljb24sIEljb25UaGVtZSB9IGZyb20gXCJmaWdtYS1wbHVnaW4tZHMtc3ZlbHRlXCI7XG5cbiAgbGV0IGZpbGVzID0gbnVsbDtcbiAgZXhwb3J0IGxldCBjb25maWcgPSBudWxsO1xuXG4gIGZ1bmN0aW9uIG9uVXBsb2FkKGV2ZW50KSB7XG4gICAgZmlsZXMgPSBldmVudC50YXJnZXQuZmlsZXM7XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIHJlYWRlci5vbmFib3J0ID0gKCkgPT4gY29uc29sZS5sb2coXCJmaWxlIHJlYWRpbmcgd2FzIGFib3J0ZWRcIik7XG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiBjb25zb2xlLmxvZyhcImZpbGUgcmVhZGluZyBoYXMgZmFpbGVkXCIpO1xuICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBiaW5hcnlTdHIgPSByZWFkZXIucmVzdWx0O1xuICAgICAgY29uZmlnID0gYmluYXJ5U3RyO1xuICAgIH07XG4gICAgWy4uLmZpbGVzXS5mb3JFYWNoKGZpbGUgPT4gcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlKSk7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIFt0eXBlPVwiZmlsZVwiXSB7XG4gICAgYm9yZGVyOiAwO1xuICAgIGNsaXA6IHJlY3QoMCwgMCwgMCwgMCk7XG4gICAgaGVpZ2h0OiAxcHg7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBwYWRkaW5nOiAwO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZSAhaW1wb3J0YW50O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgd2lkdGg6IDFweDtcbiAgfVxuXG4gIFt0eXBlPVwiZmlsZVwiXSArIGxhYmVsIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ibGFjayk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1zbWFsbCk7XG4gICAgY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtc21hbGwpO1xuICAgIGhlaWdodDogdmFyKC0tc2l6ZS1tZWRpdW0pO1xuICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgcGFkZGluZy1yaWdodDogdmFyKC0tc2l6ZS14c21hbGwpO1xuICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4zcztcbiAgfVxuXG4gIGxhYmVsIHtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIG1heC13aWR0aDogMjUwcHg7XG4gIH1cblxuICBsYWJlbCBzcGFuIHtcbiAgICBtYXJnaW4tcmlnaHQ6IHZhcigtLXNpemUteHhzbWFsbCk7XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICB9XG5cbiAgW3R5cGU9XCJmaWxlXCJdOmZvY3VzICsgbGFiZWwsXG4gIFt0eXBlPVwiZmlsZVwiXSArIGxhYmVsOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wdXJwbGUpO1xuICB9XG5cbiAgW3R5cGU9XCJmaWxlXCJdOmZvY3VzICsgbGFiZWwge1xuICAgIG91dGxpbmU6IDFweCBkb3R0ZWQgIzAwMDtcbiAgICBvdXRsaW5lOiAtd2Via2l0LWZvY3VzLXJpbmctY29sb3IgYXV0byA1cHg7XG4gIH1cbjwvc3R5bGU+XG5cbjxpbnB1dCB0eXBlPVwiZmlsZVwiIGlkPVwidGhlbWUtZmlsZVwiIG9uOmNoYW5nZT17b25VcGxvYWR9IC8+XG48bGFiZWwgZm9yPVwidGhlbWUtZmlsZVwiPlxuICA8SWNvbiBpY29uTmFtZT17SWNvblRoZW1lfSBjb2xvcj1cIndoaXRlXCIgLz5cbiAgeyNpZiBmaWxlcyAmJiBmaWxlc1swXX1cbiAgICA8c3Bhbj57ZmlsZXNbMF0ubmFtZX08L3NwYW4+XG4gIHs6ZWxzZX1cbiAgICA8c3Bhbj5VcGxvYWQgY29uZmlnPC9zcGFuPlxuICB7L2lmfVxuPC9sYWJlbD5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFxQkUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLDRCQUFDLENBQUMsQUFDYixNQUFNLENBQUUsQ0FBQyxDQUNULElBQUksQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN0QixNQUFNLENBQUUsR0FBRyxDQUNYLFFBQVEsQ0FBRSxNQUFNLENBQ2hCLE9BQU8sQ0FBRSxDQUFDLENBQ1YsUUFBUSxDQUFFLFFBQVEsQ0FBQyxVQUFVLENBQzdCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLEtBQUssQ0FBRSxHQUFHLEFBQ1osQ0FBQyxBQUVELENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFHLEtBQUssNEJBQUMsQ0FBQyxBQUNyQixnQkFBZ0IsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUM5QixhQUFhLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxDQUN6QyxLQUFLLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FDbkIsTUFBTSxDQUFFLE9BQU8sQ0FDZixPQUFPLENBQUUsV0FBVyxDQUNwQixTQUFTLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxDQUNqQyxNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDMUIsV0FBVyxDQUFFLElBQUksYUFBYSxDQUFDLENBQy9CLFlBQVksQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUNoQyxhQUFhLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDakMsVUFBVSxDQUFFLGdCQUFnQixDQUFDLElBQUksQUFDbkMsQ0FBQyxBQUVELEtBQUssNEJBQUMsQ0FBQyxBQUNMLFFBQVEsQ0FBRSxNQUFNLENBQ2hCLFNBQVMsQ0FBRSxLQUFLLEFBQ2xCLENBQUMsQUFFRCxtQkFBSyxDQUFDLElBQUksY0FBQyxDQUFDLEFBQ1YsWUFBWSxDQUFFLElBQUksY0FBYyxDQUFDLENBQ2pDLGFBQWEsQ0FBRSxRQUFRLENBQ3ZCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLFFBQVEsQ0FBRSxNQUFNLEFBQ2xCLENBQUMsQUFFRCxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFHLGlDQUFLLENBQzNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFHLGlDQUFLLE1BQU0sQUFBQyxDQUFDLEFBQzNCLGdCQUFnQixDQUFFLElBQUksUUFBUSxDQUFDLEFBQ2pDLENBQUMsQUFFRCxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFHLEtBQUssNEJBQUMsQ0FBQyxBQUMzQixPQUFPLENBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3hCLE9BQU8sQ0FBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxBQUM1QyxDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (75:2) {:else}
    function create_else_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Upload config";
    			attr_dev(span, "class", "svelte-xw3wmi");
    			add_location(span, file$4, 75, 4, 1788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(75:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if files && files[0]}
    function create_if_block$1(ctx) {
    	let span;
    	let t_value = /*files*/ ctx[0][0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-xw3wmi");
    			add_location(span, file$4, 73, 4, 1745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*files*/ 1 && t_value !== (t_value = /*files*/ ctx[0][0].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(73:2) {#if files && files[0]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let current;
    	let dispose;

    	const icon = new Icon({
    			props: { iconName: IconTheme, color: "white" },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*files*/ ctx[0] && /*files*/ ctx[0][0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			create_component(icon.$$.fragment);
    			t1 = space();
    			if_block.c();
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "theme-file");
    			attr_dev(input, "class", "svelte-xw3wmi");
    			add_location(input, file$4, 69, 0, 1585);
    			attr_dev(label, "for", "theme-file");
    			attr_dev(label, "class", "svelte-xw3wmi");
    			add_location(label, file$4, 70, 0, 1644);
    			dispose = listen_dev(input, "change", /*onUpload*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);
    			mount_component(icon, label, null);
    			append_dev(label, t1);
    			if_block.m(label, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    			destroy_component(icon);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let files = null;
    	let { config = null } = $$props;

    	function onUpload(event) {
    		$$invalidate(0, files = event.target.files);
    		const reader = new FileReader();
    		reader.onabort = () => console.log("file reading was aborted");
    		reader.onerror = () => console.log("file reading has failed");

    		reader.onload = () => {
    			const binaryStr = reader.result;
    			$$invalidate(2, config = binaryStr);
    		};

    		[...files].forEach(file => reader.readAsBinaryString(file));
    	}

    	const writable_props = ["config"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<FileInput> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("config" in $$props) $$invalidate(2, config = $$props.config);
    	};

    	$$self.$capture_state = () => {
    		return { files, config };
    	};

    	$$self.$inject_state = $$props => {
    		if ("files" in $$props) $$invalidate(0, files = $$props.files);
    		if ("config" in $$props) $$invalidate(2, config = $$props.config);
    	};

    	return [files, onUpload, config];
    }

    class FileInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-xw3wmi-style")) add_css$4();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { config: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileInput",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get config() {
    		throw new Error("<FileInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<FileInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PluginUI.svelte generated by Svelte v3.16.7 */
    const file$5 = "src/PluginUI.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-v31qci-style";
    	style.textContent = ".wrapper.svelte-v31qci{text-align:center}.footer.svelte-v31qci{padding-top:var(--size-xxsmall);border-top:1px solid var(--hover-fill)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGx1Z2luVUkuc3ZlbHRlIiwic291cmNlcyI6WyJQbHVnaW5VSS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgR2xvYmFsQ1NTIH0gZnJvbSBcImZpZ21hLXBsdWdpbi1kcy1zdmVsdGVcIjtcbiAgaW1wb3J0IHsgVHlwZSB9IGZyb20gXCJmaWdtYS1wbHVnaW4tZHMtc3ZlbHRlXCI7XG5cbiAgaW1wb3J0IEFkZFN0eWxlcyBmcm9tIFwiLi9jb21wb25lbnRzL0FkZFN0eWxlcy5zdmVsdGVcIjtcbiAgaW1wb3J0IEZpbGVJbnB1dCBmcm9tIFwiLi9jb21wb25lbnRzL0ZpbGVJbnB1dC5zdmVsdGVcIjtcblxuICBsZXQgY29uZmlnID0gbnVsbDtcbiAgbGV0IGRpc2FibGVkID0gdHJ1ZTtcblxuICAkOiBkaXNhYmxlZCA9IGNvbmZpZyA9PT0gbnVsbDtcblxuICBmdW5jdGlvbiBjcmVhdGVTdHlsZXMoKSB7XG4gICAgcGFyZW50LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICBwbHVnaW5NZXNzYWdlOiB7XG4gICAgICAgICAgdHlwZTogXCJDUkVBVEVfU1RZTEVTXCIsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjb2xvcnM6IHRydWUsXG4gICAgICAgICAgICAgIHR5cG9ncmFwaHk6IGZhbHNlLFxuICAgICAgICAgICAgICBzaGFkb3dzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgLyogQWRkIGFkZGl0aW9uYWwgZ2xvYmFsIG9yIHNjb3BlZCBzdHlsZXMgaGVyZSAqL1xuICAud3JhcHBlciB7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG4gIC5mb290ZXIge1xuICAgIHBhZGRpbmctdG9wOiB2YXIoLS1zaXplLXh4c21hbGwpO1xuICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ob3Zlci1maWxsKTtcbiAgfVxuPC9zdHlsZT5cblxuPGRpdiBjbGFzcz1cIndyYXBwZXIgcC14c21hbGxcIj5cbiAgPEZpbGVJbnB1dCBiaW5kOmNvbmZpZyAvPlxuICA8QWRkU3R5bGVzIG9uOmNsaWNrPXtjcmVhdGVTdHlsZXN9IGJpbmQ6ZGlzYWJsZWQgLz5cbiAgPGRpdiBjbGFzcz1cIm10LW1lZGl1bSBmb290ZXJcIj5cbiAgICA8VHlwZT5cbiAgICAgIFVwbG9hZCBhIGZpbGUgd2l0aCBhIHZhbGlkIHRoZW1lXG4gICAgICA8YVxuICAgICAgICBocmVmPVwiaHR0cHM6Ly90aGVtZS11aS5jb20vdGhlbWUtc3BlY1wiXG4gICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj5cbiAgICAgICAgc3BlY2lmaWNhdGlvblxuICAgICAgPC9hPlxuICAgIDwvVHlwZT5cbiAgICA8VHlwZT5cbiAgICAgIDxhXG4gICAgICAgIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vTGVrb0FydHMvZmlnbWEtdGhlbWUtdWlcIlxuICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+XG4gICAgICAgIEdpdEh1YlxuICAgICAgPC9hPlxuICAgIDwvVHlwZT5cbiAgPC9kaXY+XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrQ0UsUUFBUSxjQUFDLENBQUMsQUFDUixVQUFVLENBQUUsTUFBTSxBQUNwQixDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDUCxXQUFXLENBQUUsSUFBSSxjQUFjLENBQUMsQ0FDaEMsVUFBVSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsQUFDekMsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    // (48:4) <Type>
    function create_default_slot_1(ctx) {
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			t0 = text("Upload a file with a valid theme\n      ");
    			a = element("a");
    			a.textContent = "specification";
    			attr_dev(a, "href", "https://theme-ui.com/theme-spec");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer noopener");
    			add_location(a, file$5, 49, 6, 1068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(48:4) <Type>",
    		ctx
    	});

    	return block;
    }

    // (57:4) <Type>
    function create_default_slot$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GitHub";
    			attr_dev(a, "href", "https://github.com/LekoArts/figma-theme-ui");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer noopener");
    			add_location(a, file$5, 57, 6, 1239);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(57:4) <Type>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let updating_config;
    	let t0;
    	let updating_disabled;
    	let t1;
    	let div0;
    	let t2;
    	let current;

    	function fileinput_config_binding(value) {
    		/*fileinput_config_binding*/ ctx[3].call(null, value);
    	}

    	let fileinput_props = {};

    	if (/*config*/ ctx[0] !== void 0) {
    		fileinput_props.config = /*config*/ ctx[0];
    	}

    	const fileinput = new FileInput({ props: fileinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(fileinput, "config", fileinput_config_binding));

    	function addstyles_disabled_binding(value_1) {
    		/*addstyles_disabled_binding*/ ctx[4].call(null, value_1);
    	}

    	let addstyles_props = {};

    	if (/*disabled*/ ctx[1] !== void 0) {
    		addstyles_props.disabled = /*disabled*/ ctx[1];
    	}

    	const addstyles = new AddStyles({ props: addstyles_props, $$inline: true });
    	binding_callbacks.push(() => bind(addstyles, "disabled", addstyles_disabled_binding));
    	addstyles.$on("click", /*createStyles*/ ctx[2]);

    	const type0 = new Type({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const type1 = new Type({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(fileinput.$$.fragment);
    			t0 = space();
    			create_component(addstyles.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			create_component(type0.$$.fragment);
    			t2 = space();
    			create_component(type1.$$.fragment);
    			attr_dev(div0, "class", "mt-medium footer svelte-v31qci");
    			add_location(div0, file$5, 46, 2, 981);
    			attr_dev(div1, "class", "wrapper p-xsmall svelte-v31qci");
    			add_location(div1, file$5, 43, 0, 866);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(fileinput, div1, null);
    			append_dev(div1, t0);
    			mount_component(addstyles, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(type0, div0, null);
    			append_dev(div0, t2);
    			mount_component(type1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fileinput_changes = {};

    			if (!updating_config && dirty & /*config*/ 1) {
    				updating_config = true;
    				fileinput_changes.config = /*config*/ ctx[0];
    				add_flush_callback(() => updating_config = false);
    			}

    			fileinput.$set(fileinput_changes);
    			const addstyles_changes = {};

    			if (!updating_disabled && dirty & /*disabled*/ 2) {
    				updating_disabled = true;
    				addstyles_changes.disabled = /*disabled*/ ctx[1];
    				add_flush_callback(() => updating_disabled = false);
    			}

    			addstyles.$set(addstyles_changes);
    			const type0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				type0_changes.$$scope = { dirty, ctx };
    			}

    			type0.$set(type0_changes);
    			const type1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				type1_changes.$$scope = { dirty, ctx };
    			}

    			type1.$set(type1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileinput.$$.fragment, local);
    			transition_in(addstyles.$$.fragment, local);
    			transition_in(type0.$$.fragment, local);
    			transition_in(type1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileinput.$$.fragment, local);
    			transition_out(addstyles.$$.fragment, local);
    			transition_out(type0.$$.fragment, local);
    			transition_out(type1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(fileinput);
    			destroy_component(addstyles);
    			destroy_component(type0);
    			destroy_component(type1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let config = null;
    	let disabled = true;

    	function createStyles() {
    		parent.postMessage(
    			{
    				pluginMessage: {
    					type: "CREATE_STYLES",
    					payload: {
    						options: {
    							colors: true,
    							typography: false,
    							shadows: false
    						},
    						config
    					}
    				}
    			},
    			"*"
    		);
    	}

    	function fileinput_config_binding(value) {
    		config = value;
    		$$invalidate(0, config);
    	}

    	function addstyles_disabled_binding(value_1) {
    		disabled = value_1;
    		($$invalidate(1, disabled), $$invalidate(0, config));
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*config*/ 1) {
    			 $$invalidate(1, disabled = config === null);
    		}
    	};

    	return [
    		config,
    		disabled,
    		createStyles,
    		fileinput_config_binding,
    		addstyles_disabled_binding
    	];
    }

    class PluginUI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-v31qci-style")) add_css$5();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PluginUI",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new PluginUI({
    	target: document.body,
    });

    return app;

}());
