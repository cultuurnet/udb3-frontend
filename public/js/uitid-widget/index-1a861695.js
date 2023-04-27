(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) l(i);
  new MutationObserver((i) => {
    for (const r of i)
      if (r.type === 'childList')
        for (const o of r.addedNodes)
          o.tagName === 'LINK' && o.rel === 'modulepreload' && l(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(i) {
    const r = {};
    return (
      i.integrity && (r.integrity = i.integrity),
      i.referrerPolicy && (r.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === 'use-credentials'
        ? (r.credentials = 'include')
        : i.crossOrigin === 'anonymous'
        ? (r.credentials = 'omit')
        : (r.credentials = 'same-origin'),
      r
    );
  }
  function l(i) {
    if (i.ep) return;
    i.ep = !0;
    const r = n(i);
    fetch(i.href, r);
  }
})();
function $() {}
function Se(t, e) {
  for (const n in e) t[n] = e[n];
  return t;
}
function Me(t) {
  return t();
}
function ae() {
  return Object.create(null);
}
function H(t) {
  t.forEach(Me);
}
function fe(t) {
  return typeof t == 'function';
}
function L(t, e) {
  return t != t
    ? e == e
    : t !== e || (t && typeof t == 'object') || typeof t == 'function';
}
let G;
function de(t, e) {
  return G || (G = document.createElement('a')), (G.href = e), t === G.href;
}
function Fe(t) {
  return Object.keys(t).length === 0;
}
function Ne(t, ...e) {
  if (t == null) return $;
  const n = t.subscribe(...e);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
function Z(t, e, n) {
  t.$$.on_destroy.push(Ne(e, n));
}
function W(t, e, n, l) {
  if (t) {
    const i = je(t, e, n, l);
    return t[0](i);
  }
}
function je(t, e, n, l) {
  return t[1] && l ? Se(n.ctx.slice(), t[1](l(e))) : n.ctx;
}
function J(t, e, n, l) {
  if (t[2] && l) {
    const i = t[2](l(n));
    if (e.dirty === void 0) return i;
    if (typeof i == 'object') {
      const r = [],
        o = Math.max(e.dirty.length, i.length);
      for (let s = 0; s < o; s += 1) r[s] = e.dirty[s] | i[s];
      return r;
    }
    return e.dirty | i;
  }
  return e.dirty;
}
function K(t, e, n, l, i, r) {
  if (i) {
    const o = je(e, n, l, r);
    t.p(o, i);
  }
}
function Y(t) {
  if (t.ctx.length > 32) {
    const e = [],
      n = t.ctx.length / 32;
    for (let l = 0; l < n; l++) e[l] = -1;
    return e;
  }
  return -1;
}
function _e(t) {
  return t ?? '';
}
function v(t, e) {
  t.appendChild(e);
}
function p(t, e, n) {
  t.insertBefore(e, n || null);
}
function _(t) {
  t.parentNode && t.parentNode.removeChild(t);
}
function He(t, e) {
  for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e);
}
function w(t) {
  return document.createElement(t);
}
function T(t) {
  return document.createElementNS('http://www.w3.org/2000/svg', t);
}
function N(t) {
  return document.createTextNode(t);
}
function k() {
  return N(' ');
}
function Ce() {
  return N('');
}
function qe(t, e, n, l) {
  return t.addEventListener(e, n, l), () => t.removeEventListener(e, n, l);
}
function c(t, e, n) {
  n == null
    ? t.removeAttribute(e)
    : t.getAttribute(e) !== n && t.setAttribute(e, n);
}
function Ve(t) {
  return Array.from(t.childNodes);
}
function D(t, e) {
  (e = '' + e), t.data !== e && (t.data = e);
}
let V;
function q(t) {
  V = t;
}
function We() {
  if (!V) throw new Error('Function called outside component initialization');
  return V;
}
function Je(t) {
  We().$$.on_mount.push(t);
}
function De(t, e) {
  const n = t.$$.callbacks[e.type];
  n && n.slice().forEach((l) => l.call(this, e));
}
const S = [],
  me = [];
let F = [];
const pe = [],
  Ke = Promise.resolve();
let re = !1;
function Ye() {
  re || ((re = !0), Ke.then(Oe));
}
function oe(t) {
  F.push(t);
}
const le = new Set();
let P = 0;
function Oe() {
  if (P !== 0) return;
  const t = V;
  do {
    try {
      for (; P < S.length; ) {
        const e = S[P];
        P++, q(e), Ge(e.$$);
      }
    } catch (e) {
      throw ((S.length = 0), (P = 0), e);
    }
    for (q(null), S.length = 0, P = 0; me.length; ) me.pop()();
    for (let e = 0; e < F.length; e += 1) {
      const n = F[e];
      le.has(n) || (le.add(n), n());
    }
    F.length = 0;
  } while (S.length);
  for (; pe.length; ) pe.pop()();
  (re = !1), le.clear(), q(t);
}
function Ge(t) {
  if (t.fragment !== null) {
    t.update(), H(t.before_update);
    const e = t.dirty;
    (t.dirty = [-1]),
      t.fragment && t.fragment.p(t.ctx, e),
      t.after_update.forEach(oe);
  }
}
function Qe(t) {
  const e = [],
    n = [];
  F.forEach((l) => (t.indexOf(l) === -1 ? e.push(l) : n.push(l))),
    n.forEach((l) => l()),
    (F = e);
}
const X = new Set();
let A;
function B() {
  A = { r: 0, c: [], p: A };
}
function R() {
  A.r || H(A.c), (A = A.p);
}
function m(t, e) {
  t && t.i && (X.delete(t), t.i(e));
}
function g(t, e, n, l) {
  if (t && t.o) {
    if (X.has(t)) return;
    X.add(t),
      A.c.push(() => {
        X.delete(t), l && (n && t.d(1), l());
      }),
      t.o(e);
  } else l && l();
}
function E(t) {
  t && t.c();
}
function U(t, e, n, l) {
  const { fragment: i, after_update: r } = t.$$;
  i && i.m(e, n),
    l ||
      oe(() => {
        const o = t.$$.on_mount.map(Me).filter(fe);
        t.$$.on_destroy ? t.$$.on_destroy.push(...o) : H(o),
          (t.$$.on_mount = []);
      }),
    r.forEach(oe);
}
function y(t, e) {
  const n = t.$$;
  n.fragment !== null &&
    (Qe(n.after_update),
    H(n.on_destroy),
    n.fragment && n.fragment.d(e),
    (n.on_destroy = n.fragment = null),
    (n.ctx = []));
}
function Xe(t, e) {
  t.$$.dirty[0] === -1 && (S.push(t), Ye(), t.$$.dirty.fill(0)),
    (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31);
}
function j(t, e, n, l, i, r, o, s = [-1]) {
  const f = V;
  q(t);
  const u = (t.$$ = {
    fragment: null,
    ctx: [],
    props: r,
    update: $,
    not_equal: i,
    bound: ae(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (f ? f.$$.context : [])),
    callbacks: ae(),
    dirty: s,
    skip_bound: !1,
    root: e.target || f.$$.root,
  });
  o && o(u.root);
  let a = !1;
  if (
    ((u.ctx = n
      ? n(t, e.props || {}, (d, h, ...b) => {
          const M = b.length ? b[0] : h;
          return (
            u.ctx &&
              i(u.ctx[d], (u.ctx[d] = M)) &&
              (!u.skip_bound && u.bound[d] && u.bound[d](M), a && Xe(t, d)),
            h
          );
        })
      : []),
    u.update(),
    (a = !0),
    H(u.before_update),
    (u.fragment = l ? l(u.ctx) : !1),
    e.target)
  ) {
    if (e.hydrate) {
      const d = Ve(e.target);
      u.fragment && u.fragment.l(d), d.forEach(_);
    } else u.fragment && u.fragment.c();
    e.intro && m(t.$$.fragment),
      U(t, e.target, e.anchor, e.customElement),
      Oe();
  }
  q(f);
}
class C {
  $destroy() {
    y(this, 1), (this.$destroy = $);
  }
  $on(e, n) {
    if (!fe(n)) return $;
    const l = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return (
      l.push(n),
      () => {
        const i = l.indexOf(n);
        i !== -1 && l.splice(i, 1);
      }
    );
  }
  $set(e) {
    this.$$set &&
      !Fe(e) &&
      ((this.$$.skip_bound = !0), this.$$set(e), (this.$$.skip_bound = !1));
  }
}
class O extends TypeError {
  constructor(e) {
    super(e), (this.name = 'UitIdWidgetError');
  }
}
function Te() {
  const t = document.getElementById('uitid-widget-config');
  if (!t) throw new O('missing script with widget config');
  const {
    applicationName: e,
    language: n,
    auth0Domain: l,
    loginUrl: i,
    logoutUrl: r,
    accessTokenCookieName: o,
    actions: s = [],
    uitidProfileUrl: f,
  } = JSON.parse(t == null ? void 0 : t.textContent) ?? {};
  if (!f) throw new O('uitidProfileUrl should be provided');
  if (!e) throw new O('applictationName should be provided');
  if (!l) throw new O('auth0Domain should be provided');
  if (!i) throw new O('loginUrl should be provided');
  if (!r) throw new O('logoutUrl should be provided');
  if (!o) throw new O('accessTokenCookieName should be provided');
  return {
    applicationName: e,
    actions: s,
    language: n,
    auth0Domain: l,
    loginUrl: i,
    logoutUrl: r,
    accessTokenCookieName: o,
    uitidProfileUrl: f,
  };
}
async function Ze(t) {
  try {
    const e = new URL(Te().auth0Domain + '/userinfo'),
      n = await fetch(e, { headers: { authorization: 'Bearer ' + t } });
    if (!n.ok) {
      console.log(n.status, n.statusText);
      return;
    }
    return await n.json();
  } catch (e) {
    console.log('ERROR', e);
  }
}
const z = [];
function xe(t, e) {
  return { subscribe: Ae(t, e).subscribe };
}
function Ae(t, e = $) {
  let n;
  const l = new Set();
  function i(s) {
    if (L(t, s) && ((t = s), n)) {
      const f = !z.length;
      for (const u of l) u[1](), z.push(u, t);
      if (f) {
        for (let u = 0; u < z.length; u += 2) z[u][0](z[u + 1]);
        z.length = 0;
      }
    }
  }
  function r(s) {
    i(s(t));
  }
  function o(s, f = $) {
    const u = [s, f];
    return (
      l.add(u),
      l.size === 1 && (n = e(i) || $),
      s(t),
      () => {
        l.delete(u), l.size === 0 && n && (n(), (n = null));
      }
    );
  }
  return { set: i, update: r, subscribe: o };
}
function et(t, e, n) {
  const l = !Array.isArray(t),
    i = l ? [t] : t,
    r = e.length < 2;
  return xe(n, (o) => {
    let s = !1;
    const f = [];
    let u = 0,
      a = $;
    const d = () => {
        if (u) return;
        a();
        const b = e(l ? f[0] : f, o);
        r ? o(b) : (a = fe(b) ? b : $);
      },
      h = i.map((b, M) =>
        Ne(
          b,
          (te) => {
            (f[M] = te), (u &= ~(1 << M)), s && d();
          },
          () => {
            u |= 1 << M;
          },
        ),
      );
    return (
      (s = !0),
      d(),
      function () {
        H(h), a(), (s = !1);
      }
    );
  });
}
const tt = {
    nl: {
      login: 'Inloggen',
      myUitid: 'Mijn UiTiD',
      moderate: 'UiTiD beheren',
      logout: 'Afmelden',
      noUitid: 'Nog geen UiTiD?',
      makeUitid: 'Maak er eentje aan',
    },
    fr: {
      login: 'Login FR',
      myUitid: 'Mijn UiTiD FR',
      moderate: 'UiTiD beheren FR',
      logout: 'Afmelden FR',
      noUitid: 'Nog geen UiTiD? FR',
      makeUitid: 'Maak er eentje aan FR',
    },
    de: {
      login: 'Login DE',
      myUitid: 'Mijn UiTiD DE',
      moderate: 'UiTiD beheren DE',
      logout: 'Afmelden DE',
      noUitid: 'Nog geen UiTiD? DE',
      makeUitid: 'Maak er eentje aan DE',
    },
    en: {
      login: 'Login EN',
      myUitid: 'Mijn UiTiD EN',
      moderate: 'UiTiD beheren EN',
      logout: 'Afmelden EN',
      noUitid: 'Nog geen UiTiD? EN',
      makeUitid: 'Maak er eentje aan EN',
    },
  },
  x = Ae('en');
function nt(t, e, n) {
  if (!e) throw new Error('no key provided to $t()');
  if (!t) throw new Error(`no translation for key "${e}"`);
  let l = tt[t][e];
  if (!l) throw new Error(`no translation found for ${t}.${e}`);
  return (
    Object.keys(n).map((i) => {
      const r = new RegExp(`{{${i}}}`, 'g');
      l = l.replace(r, n[i]);
    }),
    l
  );
}
const ue = et(
  x,
  (t) =>
    (e, n = {}) =>
      nt(t, e, n),
);
/*! js-cookie v3.0.5 | MIT */ function Q(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e];
    for (var l in n) t[l] = n[l];
  }
  return t;
}
var it = {
  read: function (t) {
    return (
      t[0] === '"' && (t = t.slice(1, -1)),
      t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    );
  },
  write: function (t) {
    return encodeURIComponent(t).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent,
    );
  },
};
function se(t, e) {
  function n(i, r, o) {
    if (!(typeof document > 'u')) {
      (o = Q({}, e, o)),
        typeof o.expires == 'number' &&
          (o.expires = new Date(Date.now() + o.expires * 864e5)),
        o.expires && (o.expires = o.expires.toUTCString()),
        (i = encodeURIComponent(i)
          .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
          .replace(/[()]/g, escape));
      var s = '';
      for (var f in o)
        o[f] &&
          ((s += '; ' + f), o[f] !== !0 && (s += '=' + o[f].split(';')[0]));
      return (document.cookie = i + '=' + t.write(r, i) + s);
    }
  }
  function l(i) {
    if (!(typeof document > 'u' || (arguments.length && !i))) {
      for (
        var r = document.cookie ? document.cookie.split('; ') : [],
          o = {},
          s = 0;
        s < r.length;
        s++
      ) {
        var f = r[s].split('='),
          u = f.slice(1).join('=');
        try {
          var a = decodeURIComponent(f[0]);
          if (((o[a] = t.read(u, a)), i === a)) break;
        } catch {}
      }
      return i ? o[i] : o;
    }
  }
  return Object.create(
    {
      set: n,
      get: l,
      remove: function (i, r) {
        n(i, '', Q({}, r, { expires: -1 }));
      },
      withAttributes: function (i) {
        return se(this.converter, Q({}, this.attributes, i));
      },
      withConverter: function (i) {
        return se(Q({}, this.converter, i), this.attributes);
      },
    },
    {
      attributes: { value: Object.freeze(e) },
      converter: { value: Object.freeze(t) },
    },
  );
}
var lt = se(it, { path: '/' });
function rt(t) {
  let e, n;
  const l = t[2].default,
    i = W(l, t, t[1], null);
  return {
    c() {
      (e = w('a')),
        i && i.c(),
        c(e, 'href', t[0]),
        c(e, 'class', 'svelte-1h2wt78');
    },
    m(r, o) {
      p(r, e, o), i && i.m(e, null), (n = !0);
    },
    p(r, [o]) {
      i &&
        i.p &&
        (!n || o & 2) &&
        K(i, l, r, r[1], n ? J(l, r[1], o, null) : Y(r[1]), null),
        (!n || o & 1) && c(e, 'href', r[0]);
    },
    i(r) {
      n || (m(i, r), (n = !0));
    },
    o(r) {
      g(i, r), (n = !1);
    },
    d(r) {
      r && _(e), i && i.d(r);
    },
  };
}
function ot(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e,
    { href: r } = e;
  return (
    (t.$$set = (o) => {
      'href' in o && n(0, (r = o.href)),
        '$$scope' in o && n(1, (i = o.$$scope));
    }),
    [r, i, l]
  );
}
class st extends C {
  constructor(e) {
    super(), j(this, e, ot, rt, L, { href: 0 });
  }
}
function ge(t) {
  let e, n;
  const l = t[2].default,
    i = W(l, t, t[1], null);
  return {
    c() {
      (e = w('h3')), i && i.c(), c(e, 'class', 'svelte-6a1km1');
    },
    m(r, o) {
      p(r, e, o), i && i.m(e, null), (n = !0);
    },
    p(r, o) {
      i &&
        i.p &&
        (!n || o & 2) &&
        K(i, l, r, r[1], n ? J(l, r[1], o, null) : Y(r[1]), null);
    },
    i(r) {
      n || (m(i, r), (n = !0));
    },
    o(r) {
      g(i, r), (n = !1);
    },
    d(r) {
      r && _(e), i && i.d(r);
    },
  };
}
function he(t) {
  let e, n;
  const l = t[2].default,
    i = W(l, t, t[1], null);
  return {
    c() {
      (e = w('h4')), i && i.c(), c(e, 'class', 'svelte-6a1km1');
    },
    m(r, o) {
      p(r, e, o), i && i.m(e, null), (n = !0);
    },
    p(r, o) {
      i &&
        i.p &&
        (!n || o & 2) &&
        K(i, l, r, r[1], n ? J(l, r[1], o, null) : Y(r[1]), null);
    },
    i(r) {
      n || (m(i, r), (n = !0));
    },
    o(r) {
      g(i, r), (n = !1);
    },
    d(r) {
      r && _(e), i && i.d(r);
    },
  };
}
function we(t) {
  let e, n;
  const l = t[2].default,
    i = W(l, t, t[1], null);
  return {
    c() {
      (e = w('h5')), i && i.c(), c(e, 'class', 'svelte-6a1km1');
    },
    m(r, o) {
      p(r, e, o), i && i.m(e, null), (n = !0);
    },
    p(r, o) {
      i &&
        i.p &&
        (!n || o & 2) &&
        K(i, l, r, r[1], n ? J(l, r[1], o, null) : Y(r[1]), null);
    },
    i(r) {
      n || (m(i, r), (n = !0));
    },
    o(r) {
      g(i, r), (n = !1);
    },
    d(r) {
      r && _(e), i && i.d(r);
    },
  };
}
function ft(t) {
  let e,
    n,
    l,
    i,
    r = t[0] === 1 && ge(t),
    o = t[0] === 2 && he(t),
    s = t[0] === 3 && we(t);
  return {
    c() {
      r && r.c(), (e = k()), o && o.c(), (n = k()), s && s.c(), (l = Ce());
    },
    m(f, u) {
      r && r.m(f, u),
        p(f, e, u),
        o && o.m(f, u),
        p(f, n, u),
        s && s.m(f, u),
        p(f, l, u),
        (i = !0);
    },
    p(f, [u]) {
      f[0] === 1
        ? r
          ? (r.p(f, u), u & 1 && m(r, 1))
          : ((r = ge(f)), r.c(), m(r, 1), r.m(e.parentNode, e))
        : r &&
          (B(),
          g(r, 1, 1, () => {
            r = null;
          }),
          R()),
        f[0] === 2
          ? o
            ? (o.p(f, u), u & 1 && m(o, 1))
            : ((o = he(f)), o.c(), m(o, 1), o.m(n.parentNode, n))
          : o &&
            (B(),
            g(o, 1, 1, () => {
              o = null;
            }),
            R()),
        f[0] === 3
          ? s
            ? (s.p(f, u), u & 1 && m(s, 1))
            : ((s = we(f)), s.c(), m(s, 1), s.m(l.parentNode, l))
          : s &&
            (B(),
            g(s, 1, 1, () => {
              s = null;
            }),
            R());
    },
    i(f) {
      i || (m(r), m(o), m(s), (i = !0));
    },
    o(f) {
      g(r), g(o), g(s), (i = !1);
    },
    d(f) {
      r && r.d(f), f && _(e), o && o.d(f), f && _(n), s && s.d(f), f && _(l);
    },
  };
}
function ut(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e,
    { level: r = 2 } = e;
  return (
    (t.$$set = (o) => {
      'level' in o && n(0, (r = o.level)),
        '$$scope' in o && n(1, (i = o.$$scope));
    }),
    [r, i, l]
  );
}
class Be extends C {
  constructor(e) {
    super(), j(this, e, ut, ft, L, { level: 0 });
  }
}
function ct(t) {
  let e, n;
  return {
    c() {
      (e = T('svg')),
        (n = T('path')),
        c(
          n,
          'd',
          'M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z',
        ),
        c(e, 'xmlns', 'http://www.w3.org/2000/svg'),
        c(e, 'width', t[0]),
        c(e, 'viewBox', '0 0 512 512');
    },
    m(l, i) {
      p(l, e, i), v(e, n);
    },
    p(l, [i]) {
      i & 1 && c(e, 'width', l[0]);
    },
    i: $,
    o: $,
    d(l) {
      l && _(e);
    },
  };
}
function at(t, e, n) {
  let { width: l } = e;
  return (
    (t.$$set = (i) => {
      'width' in i && n(0, (l = i.width));
    }),
    [l]
  );
}
class dt extends C {
  constructor(e) {
    super(), j(this, e, at, ct, L, { width: 0 });
  }
}
function _t(t) {
  let e = t[1]('myUitid') + '',
    n;
  return {
    c() {
      n = N(e);
    },
    m(l, i) {
      p(l, n, i);
    },
    p(l, i) {
      i & 2 && e !== (e = l[1]('myUitid') + '') && D(n, e);
    },
    d(l) {
      l && _(n);
    },
  };
}
function mt(t) {
  let e,
    n,
    l,
    i,
    r = t[0].email + '',
    o,
    s,
    f,
    u,
    a,
    d;
  return (
    (n = new Be({
      props: { level: 1, $$slots: { default: [_t] }, $$scope: { ctx: t } },
    })),
    (a = new dt({ props: { width: 12 } })),
    {
      c() {
        (e = w('div')),
          E(n.$$.fragment),
          (l = k()),
          (i = w('span')),
          (o = N(r)),
          (s = k()),
          (f = w('a')),
          (u = N('UiTiD beheren ')),
          E(a.$$.fragment),
          c(f, 'href', t[2]),
          c(f, 'target', '_blank'),
          c(f, 'rel', 'noopener noreferrer'),
          c(e, 'class', 'svelte-jdhr77');
      },
      m(h, b) {
        p(h, e, b),
          U(n, e, null),
          v(e, l),
          v(e, i),
          v(i, o),
          v(e, s),
          v(e, f),
          v(f, u),
          U(a, f, null),
          (d = !0);
      },
      p(h, [b]) {
        const M = {};
        b & 34 && (M.$$scope = { dirty: b, ctx: h }),
          n.$set(M),
          (!d || b & 1) && r !== (r = h[0].email + '') && D(o, r);
      },
      i(h) {
        d || (m(n.$$.fragment, h), m(a.$$.fragment, h), (d = !0));
      },
      o(h) {
        g(n.$$.fragment, h), g(a.$$.fragment, h), (d = !1);
      },
      d(h) {
        h && _(e), y(n), y(a);
      },
    }
  );
}
function pt(t, e, n) {
  let l, i;
  Z(t, x, (f) => n(4, (l = f))), Z(t, ue, (f) => n(1, (i = f)));
  let { user: r } = e,
    { uitidProfileUrl: o } = e,
    s = `${o}/${l}/profile`;
  return (
    (t.$$set = (f) => {
      'user' in f && n(0, (r = f.user)),
        'uitidProfileUrl' in f && n(3, (o = f.uitidProfileUrl));
    }),
    [r, i, s, o]
  );
}
class gt extends C {
  constructor(e) {
    super(), j(this, e, pt, mt, L, { user: 0, uitidProfileUrl: 3 });
  }
}
function ve(t, e, n) {
  const l = t.slice();
  return (l[1] = e[n]), l;
}
function be(t) {
  let e,
    n,
    l = t[1].label + '',
    i,
    r;
  return {
    c() {
      (e = w('li')), (n = w('a')), (i = N(l)), c(n, 'href', (r = t[1].url));
    },
    m(o, s) {
      p(o, e, s), v(e, n), v(n, i);
    },
    p(o, s) {
      s & 1 && l !== (l = o[1].label + '') && D(i, l),
        s & 1 && r !== (r = o[1].url) && c(n, 'href', r);
    },
    d(o) {
      o && _(e);
    },
  };
}
function ht(t) {
  let e,
    n = t[0],
    l = [];
  for (let i = 0; i < n.length; i += 1) l[i] = be(ve(t, n, i));
  return {
    c() {
      e = w('ul');
      for (let i = 0; i < l.length; i += 1) l[i].c();
      c(e, 'class', 'svelte-ir74bc');
    },
    m(i, r) {
      p(i, e, r);
      for (let o = 0; o < l.length; o += 1) l[o] && l[o].m(e, null);
    },
    p(i, [r]) {
      if (r & 1) {
        n = i[0];
        let o;
        for (o = 0; o < n.length; o += 1) {
          const s = ve(i, n, o);
          l[o] ? l[o].p(s, r) : ((l[o] = be(s)), l[o].c(), l[o].m(e, null));
        }
        for (; o < l.length; o += 1) l[o].d(1);
        l.length = n.length;
      }
    },
    i: $,
    o: $,
    d(i) {
      i && _(e), He(l, i);
    },
  };
}
function wt(t, e, n) {
  let { actions: l } = e;
  return (
    (t.$$set = (i) => {
      'actions' in i && n(0, (l = i.actions));
    }),
    [l]
  );
}
class vt extends C {
  constructor(e) {
    super(), j(this, e, wt, ht, L, { actions: 0 });
  }
}
function bt(t) {
  let e, n;
  return {
    c() {
      (e = N('Mijn ')), (n = N(t[1]));
    },
    m(l, i) {
      p(l, e, i), p(l, n, i);
    },
    p(l, i) {
      i & 2 && D(n, l[1]);
    },
    d(l) {
      l && _(e), l && _(n);
    },
  };
}
function $t(t) {
  let e, n, l, i, r;
  return (
    (n = new Be({
      props: { level: 1, $$slots: { default: [bt] }, $$scope: { ctx: t } },
    })),
    (i = new vt({ props: { actions: t[0] } })),
    {
      c() {
        (e = w('div')),
          E(n.$$.fragment),
          (l = k()),
          E(i.$$.fragment),
          c(e, 'class', 'application-section svelte-cct1jw');
      },
      m(o, s) {
        p(o, e, s), U(n, e, null), v(e, l), U(i, e, null), (r = !0);
      },
      p(o, [s]) {
        const f = {};
        s & 6 && (f.$$scope = { dirty: s, ctx: o }), n.$set(f);
        const u = {};
        s & 1 && (u.actions = o[0]), i.$set(u);
      },
      i(o) {
        r || (m(n.$$.fragment, o), m(i.$$.fragment, o), (r = !0));
      },
      o(o) {
        g(n.$$.fragment, o), g(i.$$.fragment, o), (r = !1);
      },
      d(o) {
        o && _(e), y(n), y(i);
      },
    }
  );
}
function kt(t, e, n) {
  let { actions: l } = e,
    { applicationName: i } = e;
  return (
    (t.$$set = (r) => {
      'actions' in r && n(0, (l = r.actions)),
        'applicationName' in r && n(1, (i = r.applicationName));
    }),
    [l, i]
  );
}
class Ut extends C {
  constructor(e) {
    super(), j(this, e, kt, $t, L, { actions: 0, applicationName: 1 });
  }
}
function yt(t) {
  let e,
    n,
    l = t[1]('logout') + '',
    i;
  return {
    c() {
      (e = w('div')),
        (n = w('a')),
        (i = N(l)),
        c(n, 'href', t[0]),
        c(e, 'class', 'logout-section svelte-oaqkz3');
    },
    m(r, o) {
      p(r, e, o), v(e, n), v(n, i);
    },
    p(r, [o]) {
      o & 2 && l !== (l = r[1]('logout') + '') && D(i, l),
        o & 1 && c(n, 'href', r[0]);
    },
    i: $,
    o: $,
    d(r) {
      r && _(e);
    },
  };
}
function Et(t, e, n) {
  let l;
  Z(t, ue, (r) => n(1, (l = r)));
  let { logoutUrl: i } = e;
  return (
    (t.$$set = (r) => {
      'logoutUrl' in r && n(0, (i = r.logoutUrl));
    }),
    [i, l]
  );
}
class Lt extends C {
  constructor(e) {
    super(), j(this, e, Et, yt, L, { logoutUrl: 0 });
  }
}
function Mt(t) {
  let e, n, l, i;
  const r = t[2].default,
    o = W(r, t, t[1], null);
  return {
    c() {
      (e = w('button')),
        o && o.c(),
        (e.disabled = t[0]),
        c(e, 'class', 'svelte-pier5m');
    },
    m(s, f) {
      p(s, e, f),
        o && o.m(e, null),
        (n = !0),
        l || ((i = qe(e, 'click', t[3])), (l = !0));
    },
    p(s, [f]) {
      o &&
        o.p &&
        (!n || f & 2) &&
        K(o, r, s, s[1], n ? J(r, s[1], f, null) : Y(s[1]), null),
        (!n || f & 1) && (e.disabled = s[0]);
    },
    i(s) {
      n || (m(o, s), (n = !0));
    },
    o(s) {
      g(o, s), (n = !1);
    },
    d(s) {
      s && _(e), o && o.d(s), (l = !1), i();
    },
  };
}
function Nt(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e,
    { disabled: r = !1 } = e;
  function o(s) {
    De.call(this, t, s);
  }
  return (
    (t.$$set = (s) => {
      'disabled' in s && n(0, (r = s.disabled)),
        '$$scope' in s && n(1, (i = s.$$scope));
    }),
    [r, i, l, o]
  );
}
class jt extends C {
  constructor(e) {
    super(), j(this, e, Nt, Mt, L, { disabled: 0 });
  }
}
function $e(t) {
  let e, n;
  return {
    c() {
      (e = T('svg')),
        (n = T('path')),
        c(
          n,
          'd',
          'M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z',
        ),
        c(e, 'xmlns', 'http://www.w3.org/2000/svg'),
        c(e, 'width', t[1]),
        c(e, 'viewBox', '0 0 512 512');
    },
    m(l, i) {
      p(l, e, i), v(e, n);
    },
    p(l, i) {
      i & 2 && c(e, 'width', l[1]);
    },
    d(l) {
      l && _(e);
    },
  };
}
function ke(t) {
  let e, n;
  return {
    c() {
      (e = T('svg')),
        (n = T('path')),
        c(
          n,
          'd',
          'M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z',
        ),
        c(e, 'xmlns', 'http://www.w3.org/2000/svg'),
        c(e, 'width', t[1]),
        c(e, 'viewBox', '0 0 512 512');
    },
    m(l, i) {
      p(l, e, i), v(e, n);
    },
    p(l, i) {
      i & 2 && c(e, 'width', l[1]);
    },
    d(l) {
      l && _(e);
    },
  };
}
function Ct(t) {
  let e,
    n,
    l = t[0] === 'up' && $e(t),
    i = t[0] === 'down' && ke(t);
  return {
    c() {
      l && l.c(), (e = k()), i && i.c(), (n = Ce());
    },
    m(r, o) {
      l && l.m(r, o), p(r, e, o), i && i.m(r, o), p(r, n, o);
    },
    p(r, [o]) {
      r[0] === 'up'
        ? l
          ? l.p(r, o)
          : ((l = $e(r)), l.c(), l.m(e.parentNode, e))
        : l && (l.d(1), (l = null)),
        r[0] === 'down'
          ? i
            ? i.p(r, o)
            : ((i = ke(r)), i.c(), i.m(n.parentNode, n))
          : i && (i.d(1), (i = null));
    },
    i: $,
    o: $,
    d(r) {
      l && l.d(r), r && _(e), i && i.d(r), r && _(n);
    },
  };
}
function Dt(t, e, n) {
  let { direction: l = 'down' } = e,
    { width: i } = e;
  return (
    (t.$$set = (r) => {
      'direction' in r && n(0, (l = r.direction)),
        'width' in r && n(1, (i = r.width));
    }),
    [l, i]
  );
}
class Re extends C {
  constructor(e) {
    super(), j(this, e, Dt, Ct, L, { direction: 0, width: 1 });
  }
}
function Ot(t) {
  let e, n;
  return {
    c() {
      (e = T('svg')),
        (n = T('path')),
        c(
          n,
          'd',
          'M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z',
        ),
        c(e, 'xmlns', 'http://www.w3.org/2000/svg'),
        c(e, 'width', t[0]),
        c(e, 'viewBox', '0 0 448 512');
    },
    m(l, i) {
      p(l, e, i), v(e, n);
    },
    p(l, [i]) {
      i & 1 && c(e, 'width', l[0]);
    },
    i: $,
    o: $,
    d(l) {
      l && _(e);
    },
  };
}
function Tt(t, e, n) {
  let { width: l } = e;
  return (
    (t.$$set = (i) => {
      'width' in i && n(0, (l = i.width));
    }),
    [l]
  );
}
class At extends C {
  constructor(e) {
    super(), j(this, e, Tt, Ot, L, { width: 0 });
  }
}
function Ue(t) {
  let e, n, l;
  return {
    c() {
      (e = w('div')),
        (n = k()),
        (l = w('div')),
        c(e, 'class', 'loading-img svelte-lc45d3'),
        c(l, 'class', 'loading-name svelte-lc45d3');
    },
    m(i, r) {
      p(i, e, r), p(i, n, r), p(i, l, r);
    },
    d(i) {
      i && _(e), i && _(n), i && _(l);
    },
  };
}
function ye(t) {
  let e,
    n,
    l,
    i = t[1]['https://publiq.be/first_name'] + '',
    r,
    o,
    s,
    f;
  return (
    (s = new Re({ props: { width: 15, direction: t[2] ? 'up' : 'down' } })),
    {
      c() {
        (e = w('img')),
          (l = k()),
          (r = N(i)),
          (o = k()),
          E(s.$$.fragment),
          de(e.src, (n = t[1].picture)) || c(e, 'src', n),
          c(e, 'alt', 'profile of the user'),
          c(e, 'width', '40'),
          c(e, 'height', '40'),
          c(e, 'draggable', 'false'),
          c(e, 'class', 'svelte-lc45d3');
      },
      m(u, a) {
        p(u, e, a), p(u, l, a), p(u, r, a), p(u, o, a), U(s, u, a), (f = !0);
      },
      p(u, a) {
        (!f || (a & 2 && !de(e.src, (n = u[1].picture)))) && c(e, 'src', n),
          (!f || a & 2) &&
            i !== (i = u[1]['https://publiq.be/first_name'] + '') &&
            D(r, i);
        const d = {};
        a & 4 && (d.direction = u[2] ? 'up' : 'down'), s.$set(d);
      },
      i(u) {
        f || (m(s.$$.fragment, u), (f = !0));
      },
      o(u) {
        g(s.$$.fragment, u), (f = !1);
      },
      d(u) {
        u && _(e), u && _(l), u && _(r), u && _(o), y(s, u);
      },
    }
  );
}
function Ee(t) {
  let e, n, l, i, r;
  return (
    (n = new At({ props: { width: 20 } })),
    (i = new Re({ props: { width: 15, direction: t[2] ? 'up' : 'down' } })),
    {
      c() {
        (e = w('div')),
          E(n.$$.fragment),
          (l = k()),
          E(i.$$.fragment),
          c(e, 'class', 'user-icon-circle svelte-lc45d3');
      },
      m(o, s) {
        p(o, e, s), U(n, e, null), p(o, l, s), U(i, o, s), (r = !0);
      },
      p(o, s) {
        const f = {};
        s & 4 && (f.direction = o[2] ? 'up' : 'down'), i.$set(f);
      },
      i(o) {
        r || (m(n.$$.fragment, o), m(i.$$.fragment, o), (r = !0));
      },
      o(o) {
        g(n.$$.fragment, o), g(i.$$.fragment, o), (r = !1);
      },
      d(o) {
        o && _(e), y(n), o && _(l), y(i, o);
      },
    }
  );
}
function Bt(t) {
  let e,
    n,
    l,
    i,
    r,
    o = t[0] && Ue(),
    s = t[1] && !t[0] && ye(t),
    f = !t[1] && !t[0] && Ee(t);
  return {
    c() {
      (e = w('div')),
        o && o.c(),
        (n = k()),
        s && s.c(),
        (l = k()),
        f && f.c(),
        c(
          e,
          'class',
          (i =
            _e(t[0] ? 'login-wrapper loading' : 'login-wrapper') +
            ' svelte-lc45d3'),
        );
    },
    m(u, a) {
      p(u, e, a),
        o && o.m(e, null),
        v(e, n),
        s && s.m(e, null),
        v(e, l),
        f && f.m(e, null),
        (r = !0);
    },
    p(u, a) {
      u[0] ? o || ((o = Ue()), o.c(), o.m(e, n)) : o && (o.d(1), (o = null)),
        u[1] && !u[0]
          ? s
            ? (s.p(u, a), a & 3 && m(s, 1))
            : ((s = ye(u)), s.c(), m(s, 1), s.m(e, l))
          : s &&
            (B(),
            g(s, 1, 1, () => {
              s = null;
            }),
            R()),
        !u[1] && !u[0]
          ? f
            ? (f.p(u, a), a & 3 && m(f, 1))
            : ((f = Ee(u)), f.c(), m(f, 1), f.m(e, null))
          : f &&
            (B(),
            g(f, 1, 1, () => {
              f = null;
            }),
            R()),
        (!r ||
          (a & 1 &&
            i !==
              (i =
                _e(u[0] ? 'login-wrapper loading' : 'login-wrapper') +
                ' svelte-lc45d3'))) &&
          c(e, 'class', i);
    },
    i(u) {
      r || (m(s), m(f), (r = !0));
    },
    o(u) {
      g(s), g(f), (r = !1);
    },
    d(u) {
      u && _(e), o && o.d(), s && s.d(), f && f.d();
    },
  };
}
function Rt(t) {
  let e, n;
  return (
    (e = new jt({
      props: {
        disabled: t[0],
        $$slots: { default: [Bt] },
        $$scope: { ctx: t },
      },
    })),
    e.$on('click', t[3]),
    {
      c() {
        E(e.$$.fragment);
      },
      m(l, i) {
        U(e, l, i), (n = !0);
      },
      p(l, [i]) {
        const r = {};
        i & 1 && (r.disabled = l[0]),
          i & 23 && (r.$$scope = { dirty: i, ctx: l }),
          e.$set(r);
      },
      i(l) {
        n || (m(e.$$.fragment, l), (n = !0));
      },
      o(l) {
        g(e.$$.fragment, l), (n = !1);
      },
      d(l) {
        y(e, l);
      },
    }
  );
}
function It(t, e, n) {
  let { isLoading: l = !1 } = e,
    { user: i = void 0 } = e,
    { isMenuOpen: r = !1 } = e;
  function o(s) {
    De.call(this, t, s);
  }
  return (
    (t.$$set = (s) => {
      'isLoading' in s && n(0, (l = s.isLoading)),
        'user' in s && n(1, (i = s.user)),
        'isMenuOpen' in s && n(2, (r = s.isMenuOpen));
    }),
    [l, i, r, o]
  );
}
class Pt extends C {
  constructor(e) {
    super(), j(this, e, It, Rt, L, { isLoading: 0, user: 1, isMenuOpen: 2 });
  }
}
function Le(t) {
  let e, n, l, i;
  const r = [St, zt],
    o = [];
  function s(f, u) {
    return f[2] ? 0 : 1;
  }
  return (
    (n = s(t)),
    (l = o[n] = r[n](t)),
    {
      c() {
        (e = w('div')), l.c(), c(e, 'class', 'menu-popover svelte-1xiwjkh');
      },
      m(f, u) {
        p(f, e, u), o[n].m(e, null), (i = !0);
      },
      p(f, u) {
        let a = n;
        (n = s(f)),
          n === a
            ? o[n].p(f, u)
            : (B(),
              g(o[a], 1, 1, () => {
                o[a] = null;
              }),
              R(),
              (l = o[n]),
              l ? l.p(f, u) : ((l = o[n] = r[n](f)), l.c()),
              m(l, 1),
              l.m(e, null));
      },
      i(f) {
        i || (m(l), (i = !0));
      },
      o(f) {
        g(l), (i = !1);
      },
      d(f) {
        f && _(e), o[n].d();
      },
    }
  );
}
function zt(t) {
  let e,
    n,
    l,
    i = t[3]('noUitid') + '',
    r,
    o,
    s,
    f = t[3]('makeUitid') + '',
    u,
    a;
  return (
    (e = new st({
      props: { href: t[5], $$slots: { default: [Ft] }, $$scope: { ctx: t } },
    })),
    {
      c() {
        E(e.$$.fragment),
          (n = k()),
          (l = w('div')),
          (r = N(i)),
          (o = k()),
          (s = w('a')),
          (u = N(f)),
          c(s, 'href', '#test'),
          c(l, 'class', 'register-account-container svelte-1xiwjkh');
      },
      m(d, h) {
        U(e, d, h),
          p(d, n, h),
          p(d, l, h),
          v(l, r),
          v(l, o),
          v(l, s),
          v(s, u),
          (a = !0);
      },
      p(d, h) {
        const b = {};
        h & 32776 && (b.$$scope = { dirty: h, ctx: d }),
          e.$set(b),
          (!a || h & 8) && i !== (i = d[3]('noUitid') + '') && D(r, i),
          (!a || h & 8) && f !== (f = d[3]('makeUitid') + '') && D(u, f);
      },
      i(d) {
        a || (m(e.$$.fragment, d), (a = !0));
      },
      o(d) {
        g(e.$$.fragment, d), (a = !1);
      },
      d(d) {
        y(e, d), d && _(n), d && _(l);
      },
    }
  );
}
function St(t) {
  let e, n, l, i, r, o;
  return (
    (e = new Ut({ props: { actions: t[7], applicationName: t[4] } })),
    (l = new gt({ props: { user: t[2], uitidProfileUrl: t[8] } })),
    (r = new Lt({ props: { logoutUrl: t[6] } })),
    {
      c() {
        E(e.$$.fragment),
          (n = k()),
          E(l.$$.fragment),
          (i = k()),
          E(r.$$.fragment);
      },
      m(s, f) {
        U(e, s, f), p(s, n, f), U(l, s, f), p(s, i, f), U(r, s, f), (o = !0);
      },
      p(s, f) {
        const u = {};
        f & 4 && (u.user = s[2]), l.$set(u);
      },
      i(s) {
        o ||
          (m(e.$$.fragment, s),
          m(l.$$.fragment, s),
          m(r.$$.fragment, s),
          (o = !0));
      },
      o(s) {
        g(e.$$.fragment, s), g(l.$$.fragment, s), g(r.$$.fragment, s), (o = !1);
      },
      d(s) {
        y(e, s), s && _(n), y(l, s), s && _(i), y(r, s);
      },
    }
  );
}
function Ft(t) {
  let e = t[3]('login') + '',
    n;
  return {
    c() {
      n = N(e);
    },
    m(l, i) {
      p(l, n, i);
    },
    p(l, i) {
      i & 8 && e !== (e = l[3]('login') + '') && D(n, e);
    },
    d(l) {
      l && _(n);
    },
  };
}
function Ht(t) {
  let e, n, l, i, r;
  (n = new Pt({ props: { isLoading: t[0], user: t[2], isMenuOpen: t[1] } })),
    n.$on('click', t[9]);
  let o = t[1] && Le(t);
  return {
    c() {
      (e = w('nav')),
        E(n.$$.fragment),
        (l = k()),
        (i = w('div')),
        o && o.c(),
        c(i, 'class', 'menu-popover-container svelte-1xiwjkh'),
        c(e, 'class', 'svelte-1xiwjkh');
    },
    m(s, f) {
      p(s, e, f), U(n, e, null), v(e, l), v(e, i), o && o.m(i, null), (r = !0);
    },
    p(s, [f]) {
      const u = {};
      f & 1 && (u.isLoading = s[0]),
        f & 4 && (u.user = s[2]),
        f & 2 && (u.isMenuOpen = s[1]),
        n.$set(u),
        s[1]
          ? o
            ? (o.p(s, f), f & 2 && m(o, 1))
            : ((o = Le(s)), o.c(), m(o, 1), o.m(i, null))
          : o &&
            (B(),
            g(o, 1, 1, () => {
              o = null;
            }),
            R());
    },
    i(s) {
      r || (m(n.$$.fragment, s), m(o), (r = !0));
    },
    o(s) {
      g(n.$$.fragment, s), g(o), (r = !1);
    },
    d(s) {
      s && _(e), y(n), o && o.d();
    },
  };
}
function qt(t, e, n) {
  let l;
  Z(t, ue, (I) => n(3, (l = I)));
  const {
    applicationName: i,
    language: r,
    accessTokenCookieName: o,
    loginUrl: s,
    logoutUrl: f,
    actions: u,
    uitidProfileUrl: a,
  } = Te();
  x.set(r);
  let d = !1,
    h = !1,
    b;
  Je(async () => {
    if (!ee) return;
    n(0, (d = !0)),
      new MutationObserver((ze) => {
        ze.forEach((ie) => {
          if (ie.type === 'attributes') {
            const ce = ie.target.dataset.lang;
            ce && (console.log(ie.target.dataset.lang), x.set(ce));
          }
        });
      }).observe(ee, {
        attributes: !0,
        childList: !1,
        subtree: !0,
        attributeFilter: ['data-lang'],
      });
    const ne = lt.get(o);
    ne && n(2, (b = await Ze(ne))), n(0, (d = !1));
  });
  function M(I) {
    I.target.classList.contains('menu-popover') ||
      (n(1, (h = !1)), document.body.removeEventListener('click', M));
  }
  function te() {
    n(1, (h = !0)), document.body.addEventListener('click', M);
  }
  function Ie() {
    n(1, (h = !1)), document.body.removeEventListener('click', M);
  }
  function Pe(I) {
    I.stopPropagation(), h ? Ie() : te();
  }
  return [d, h, b, l, i, s, f, u, a, Pe];
}
class Vt extends C {
  constructor(e) {
    super(), j(this, e, qt, Ht, L, {});
  }
}
function Wt(t) {
  let e, n, l;
  return (
    (n = new Vt({})),
    {
      c() {
        (e = w('div')), E(n.$$.fragment);
      },
      m(i, r) {
        p(i, e, r), U(n, e, null), (l = !0);
      },
      p: $,
      i(i) {
        l || (m(n.$$.fragment, i), (l = !0));
      },
      o(i) {
        g(n.$$.fragment, i), (l = !1);
      },
      d(i) {
        i && _(e), y(n);
      },
    }
  );
}
class Jt extends C {
  constructor(e) {
    super(), j(this, e, null, Wt, L, {});
  }
}
const ee = document.getElementById('uitid-widget');
if (!ee)
  throw new O(
    'You must include an element on your application with id uitid-widget',
  );
new Jt({ target: ee });
