// ===========================================================================
// Group Chat Builder
// ---------------------------------------------------------------------------
// Write a group chat as plain text, get back HTML to paste into a Dungeon
// Coursers post. Not in the nav. Reachable at #chat only.
//
// Two things about this tool are deliberate and easy to "fix" by mistake:
//
//  1. The output is Bootstrap 4 markup with everything else inlined. That is
//     not laziness. It is pasted into the site's own editor, which runs
//     Bootstrap and strips <style> blocks, so classes it already has plus
//     inline styles is the only thing that survives the trip.
//
//  2. The preview runs in an iframe with Bootstrap loaded inside it. Loading
//     Bootstrap on this page instead would restyle the whole calculator, and
//     previewing without it would show a layout nobody will ever see. The
//     iframe is written once and only its contents are swapped after that, so
//     typing does not refetch the stylesheet on every keystroke.
// ===========================================================================

const CHAT_KEY = 'bloodline.chat.script.v1';
const CHAT_BOOTSTRAP = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css';

const CHAT_EXAMPLE = [
    '# Settings. Change these first.',
    'group: Thursday lot',
    'me: Tealeaf',
    'theme: paper',
    '',
    '# Cast. One per line. Colours: gold blue grey red purple green teal pink orange brown black, or #hex.',
    'cast: Tealeaf = gold',
    'cast: Cappuccino = blue',
    'cast: Latte = grey',
    'cast: Sunday = red',
    '',
    'banner: Sunday: has anyone seen the van man | 3 more messages',
    '',
    '--- Thursday',
    '* Tealeaf created the group "Thursday lot"',
    '* Tealeaf added Sunday',
    '* Tealeaf added Latte',
    '* Sunday added Cappuccino',
    'Sunday 17:52: has anyone seen the van man',
    'Sunday: he said half five',
    'Latte 17:53: What did he say?',
    'Tealeaf 17:55: nothing. he was late.',
    'Sunday 17:56: [reply Tealeaf: nothing. he was late.] he is *always* late',
    '+ ❤ 2',
    '! Missed voice call from Latte · 17:58',
    'Latte 17:59: [voice 1:47]',
    'Cappuccino 18:01: ok',
    'Sunday 18:02: [poll Thursday. Yes or no. | Yes 3 | Yes but late 1 | No 0]',
    'Latte 18:03: [img https://images.unsplash.com/photo-1720214931419-7cb11ee42c59?w=800] the kitchen',
    'Sunday 18:04: [forwarded] ten things every farrier knows',
    'Sunday: [deleted]',
    'Sunday: [edited] nine things',
    'Tealeaf 18:05: [read] @Cappuccino are you on tomorrow',
    '--- unread 2',
    'Cappuccino 18:20: yes',
    'typing: Sunday'
].join('\n');

const CHAT_THEMES = {
    paper: { dark: false, page: '#d6ccb6', bg: '#e4dcc8', border: '#c9bda4', text: '#2b2419', muted: '#8c8066',
        headBg: '#2f3a2a', headText: '#ffffff', headSub: '#b7c4a3', headAvatar: '#c08a1e', headAvatarText: '#2f3a2a',
        inBg: '#ffffff', inBorder: '#e3dac6', outBg: '#dcefc8', outBorder: '#c5dcaa', outMuted: '#6c7a5f',
        sysBg: '#ebe3cf', sysBorder: '#d9cfb8', sysText: '#5a4d3a', alertBg: '#f6e4e1', alertBorder: '#e6c4bf', alertText: '#a8291f',
        ticks: '#4f8fcf', quoteBg: 'rgba(0,0,0,0.05)', footBg: '#f3ecdd', inputBg: '#ffffff', inputBorder: '#d9cfb8', sendBg: '#2f3a2a',
        bar: '#d9cfb8', barFill: '#5f8ea3', pollFill: '#2f3a2a', link: '#2b5c8a', imgMatte: '#2b2419',
        bannerBg: 'rgba(43,36,25,0.92)', bannerBorder: '#5a4d3a', bannerText: '#e9e2cf', bannerSub: '#b7c4a3' },
    dark: { dark: true, page: '#0f0c14', bg: '#1a1620', border: '#3d3449', text: '#ece6f2', muted: '#9a90a8',
        headBg: '#2a1840', headText: '#ffffff', headSub: '#a894bf', headAvatar: '#a894bf', headAvatarText: '#2a1840',
        inBg: '#2f2838', inBorder: '#3d3449', outBg: '#3a2b55', outBorder: '#4d3b6e', outMuted: '#b8a9d0',
        sysBg: '#241e2c', sysBorder: '#3d3449', sysText: '#b7adc4', alertBg: '#3a1f24', alertBorder: '#5a2f36', alertText: '#ff8a80',
        ticks: '#8fb8ff', quoteBg: 'rgba(255,255,255,0.07)', footBg: '#221c2a', inputBg: '#2f2838', inputBorder: '#3d3449', sendBg: '#a894bf',
        bar: '#3d3449', barFill: '#a894bf', pollFill: '#a894bf', link: '#9ec5ff', imgMatte: '#0f0c14',
        bannerBg: 'rgba(42,24,64,0.95)', bannerBorder: '#4d3b6e', bannerText: '#ece6f2', bannerSub: '#a894bf' },
    green: { dark: false, page: '#cfd8d3', bg: '#e5ddd5', border: '#d1d7db', text: '#111b21', muted: '#667781',
        headBg: '#075e54', headText: '#ffffff', headSub: '#cfe9e5', headAvatar: '#dfe5e7', headAvatarText: '#075e54',
        inBg: '#ffffff', inBorder: '#e0dcd6', outBg: '#dcf8c6', outBorder: '#c5e8ad', outMuted: '#667781',
        sysBg: '#e1f2fb', sysBorder: '#cfe3ee', sysText: '#54656f', alertBg: '#fde8e6', alertBorder: '#f3c9c5', alertText: '#c62828',
        ticks: '#53bdeb', quoteBg: 'rgba(0,0,0,0.05)', footBg: '#f0f0f0', inputBg: '#ffffff', inputBorder: '#d1d7db', sendBg: '#075e54',
        bar: '#d1d7db', barFill: '#53bdeb', pollFill: '#075e54', link: '#027eb5', imgMatte: '#111b21',
        bannerBg: 'rgba(17,27,33,0.92)', bannerBorder: '#54656f', bannerText: '#ffffff', bannerSub: '#cfe9e5' }
};

// Each name gets a readable ink and a brighter avatar fill, because a colour
// that reads on a white bubble is too dark for a 30px circle and the other way
// round on the dark theme.
const CHAT_COLOURS = {
    gold: ['#8a6212', '#c08a1e'], blue: ['#5f8ea3', '#9bc3d6'], grey: ['#5c646c', '#9aa3ad'], gray: ['#5c646c', '#9aa3ad'],
    red: ['#a8291f', '#d8362a'], purple: ['#6b5a7e', '#a894bf'], green: ['#3f6b3a', '#6f9f68'], teal: ['#2a7a78', '#5fb3b0'],
    pink: ['#a53a6e', '#d97fb0'], orange: ['#b5541a', '#e08a4a'], brown: ['#6b4a2b', '#a07a55'], black: ['#222222', '#444444'],
    white: ['#777777', '#dddddd'], yellow: ['#8a7a12', '#d8c22a'], navy: ['#2b3a6b', '#5468a8']
};

function chatEsc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function chatEscRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Inline formatting. Escaped first, so a cast name containing < can never
// reopen the markup.
function chatFmt(text, cast) {
    let t = chatEsc(text);
    t = t.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,!?)]|$)/g, '$1<em>$2</em>');
    t = t.replace(/~([^~\n]+)~/g, '<s>$1</s>');
    // Longest name first, or @Tea would eat the start of @Tealeaf.
    Object.keys(cast).sort((a, b) => b.length - a.length).forEach((name) => {
        t = t.replace(new RegExp('@' + chatEscRe(chatEsc(name)), 'g'),
            '<span style="color: ' + cast[name].name + '; font-weight: bold;">@' + chatEsc(name) + '</span>');
    });
    t = t.replace(/\s*\/\/\s*/g, '<br />');
    return t;
}

function chatParse(src) {
    const doc = { group: 'GROUP NAME', me: '', theme: 'paper', members: '', cast: {}, order: [], items: [] };
    const lines = String(src).split(/\r?\n/);

    // Who is in the cast, read ahead of everything else.
    //
    // "Me: hello" is a perfectly reasonable thing to write, and the settings
    // are matched without regard for case, so without this it parses as the
    // me: setting and the speaker disappears.
    //
    // The settings are documented in lower case, so that is the tiebreak:
    // written in lower case it is always a setting, and capitalised it is a
    // message if somebody has been cast under that name. "me: Tealeaf" and
    // "Me: hello" can then both appear in the same script, and a keyword
    // nobody is called, like "Theme: dark", still works either way.
    const named = {};
    lines.forEach((raw) => {
        const cm = raw.trim().match(/^cast\s*:\s*(.+?)\s*(?:=|$)/i);
        if (cm) named[cm[1].trim().toLowerCase()] = true;
    });

    lines.forEach((raw) => {
        const line = raw.trim();
        let m;
        if (!line || line.charAt(0) === '#') return;
        if ((m = line.match(/^(group|me|theme|members|cast|banner|typing)\s*:\s*(.*)$/i))
            && (m[1] === m[1].toLowerCase() || !named[m[1].toLowerCase()])) {
            const k = m[1].toLowerCase(), v = m[2].trim();
            if (k === 'cast') {
                const cm = v.match(/^(.+?)\s*=\s*([^,]+?)\s*(?:,\s*(\S+))?$/);
                if (cm) { doc.cast[cm[1]] = { colour: cm[2].trim(), initial: cm[3] || cm[1].charAt(0) }; doc.order.push(cm[1]); }
                else if (v) { doc.cast[v] = { colour: 'grey', initial: v.charAt(0) }; doc.order.push(v); }
            } else if (k === 'banner') {
                const bm = v.match(/^(.+?)\s*:\s*(.*?)(?:\s*\|\s*(.*))?$/);
                doc.items.push({ type: 'banner', sender: bm ? bm[1] : '', text: bm ? bm[2] : v, more: (bm && bm[3]) || '' });
            } else if (k === 'typing') {
                doc.items.push({ type: 'typing', sender: v });
            } else { doc[k] = v; }
            return;
        }
        if ((m = line.match(/^---\s*unread\s+(\d+)/i))) { doc.items.push({ type: 'unread', n: m[1] }); return; }
        if ((m = line.match(/^---\s*(.*)$/))) { doc.items.push({ type: 'date', text: m[1] }); return; }
        if ((m = line.match(/^\*\s*(.*)$/))) { doc.items.push({ type: 'system', text: m[1] }); return; }
        if ((m = line.match(/^!\s*(.*)$/))) { doc.items.push({ type: 'system', alert: true, text: m[1] }); return; }
        if ((m = line.match(/^\+\s*(.*)$/))) { doc.items.push({ type: 'react', text: m[1] }); return; }
        if ((m = line.match(/^([^:[\]]+?)(?:\s+(\d{1,2}:\d{2}))?\s*:\s*(.*)$/))) {
            const msg = { type: 'msg', sender: m[1].trim(), time: m[2] || '', text: m[3], tags: {} };
            let t = msg.text, tm;
            while ((tm = t.match(/^\[(\w+)([^\]]*)\]\s*/))) { msg.tags[tm[1].toLowerCase()] = tm[2].trim(); t = t.slice(tm[0].length); }
            msg.text = t;
            if ('typing' in msg.tags) { doc.items.push({ type: 'typing', sender: msg.sender }); return; }
            doc.items.push(msg);
            return;
        }
        // Anything left is a line the parser could not place. Say so in the
        // preview rather than dropping it, or a typo just silently vanishes.
        doc.items.push({ type: 'note', text: line });
    });
    return doc;
}

function chatAvatar(c, size) {
    return '<div class="rounded-circle d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style="width: ' + size +
        'px; height: ' + size + 'px; background-color: ' + c.avatar +
        '; color: #ffffff; font-family: georgia,serif; font-size: 0.85em;">' + chatEsc(c.initial) + '</div>';
}
function chatSpacer() { return '<div class="mr-2 flex-shrink-0" style="width: 30px;"></div>'; }
function chatPill(text, T, alert) {
    const bg = alert ? T.alertBg : T.sysBg, bd = alert ? T.alertBorder : T.sysBorder, fg = alert ? T.alertText : T.sysText;
    return '<div class="text-center mb-2"><span class="d-inline-block rounded-pill px-3 py-1" style="background-color: ' + bg +
        '; border: 1px solid ' + bd + '; color: ' + fg + '; font-size: 0.75em;">' + text + '</span></div>';
}
function chatBar(pct, fill, T) {
    return '<div class="progress flex-grow-1" style="height: 4px; background-color: ' + T.bar +
        ';"><div class="progress-bar" style="width: ' + pct + '%; background-color: ' + fill + ';"></div></div>';
}

function chatRender(doc) {
    const T = CHAT_THEMES[(doc.theme || 'paper').toLowerCase()] || CHAT_THEMES.paper;
    const cast = {};
    doc.order.forEach((n) => {
        const c = doc.cast[n], key = String(c.colour).toLowerCase(), p = CHAT_COLOURS[key] || [c.colour, c.colour];
        cast[n] = { name: T.dark ? p[1] : p[0], avatar: p[1], initial: c.initial };
    });
    const get = n => cast[n] || { name: T.muted, avatar: T.muted, initial: String(n || '?').charAt(0) };

    const banners = [], thread = [];
    let prev = null, lastBubbleWasMine = false;

    doc.items.forEach((it) => {
        if (it.type === 'banner') {
            banners.push(
                '<div class="container mb-3" style="max-width: 420px;">' +
                '<div class="rounded px-3 py-2" style="background-color: ' + T.bannerBg + '; color: ' + T.bannerText + '; border: 1px solid ' + T.bannerBorder + ';">' +
                '<div class="d-flex justify-content-between" style="font-family: \'courier new\', monospace; font-size: 0.7em; letter-spacing: 2px; color: ' + T.bannerSub + ';"><span>' +
                chatEsc(doc.group).toUpperCase() + '</span><span>now</span></div>' +
                '<div style="font-size: 0.9em;">' + (it.sender ? '<strong style="color: #ffffff;">' + chatEsc(it.sender) + '</strong> &middot; ' : '') + chatFmt(it.text, cast) + '</div>' +
                (it.more ? '<div class="mt-1" style="font-size: 0.72em; color: ' + T.bannerSub + ';">' + chatEsc(it.more) + '</div>' : '') +
                '</div></div>');
            return;
        }
        if (it.type === 'date') {
            prev = null;
            thread.push('<div class="text-center mb-3"><span class="d-inline-block rounded-pill px-3 py-1 text-uppercase" style="background-color: ' + T.sysBg +
                '; border: 1px solid ' + T.sysBorder + '; color: ' + T.sysText +
                '; font-family: \'courier new\', monospace; font-size: 0.68em; letter-spacing: 2px;">' + chatEsc(it.text) + '</span></div>');
            return;
        }
        if (it.type === 'unread') {
            prev = null;
            thread.push('<div class="text-center my-3" style="border-top: 1px solid ' + T.border + '; line-height: 0;"><span class="d-inline-block px-3 text-uppercase" style="background-color: ' + T.bg +
                '; color: ' + T.sysText + '; font-family: \'courier new\', monospace; font-size: 0.66em; letter-spacing: 2px; line-height: 1;">' +
                chatEsc(it.n) + ' unread message' + (it.n === '1' ? '' : 's') + '</span></div>');
            return;
        }
        if (it.type === 'system') { prev = null; thread.push(chatPill(chatFmt(it.text, cast), T, it.alert)); return; }
        if (it.type === 'note') { prev = null; thread.push(chatPill('<em>(couldn\'t read this line: ' + chatEsc(it.text) + ')</em>', T, true)); return; }
        if (it.type === 'react') {
            const pills = it.text.split(/\s*,\s*/).filter(Boolean).map(r =>
                '<span class="d-inline-block rounded-pill px-2" style="background-color: ' + T.inBg + '; border: 1px solid ' + T.inBorder +
                '; color: ' + T.text + '; font-size: 0.72em; line-height: 1.6;">' + chatEsc(r) + '</span>').join(' ');
            thread.push('<div class="d-flex mb-3' + (lastBubbleWasMine ? ' justify-content-end' : '') + '" style="margin-top: -6px;">' +
                (lastBubbleWasMine ? '' : chatSpacer()) + '<div class="' + (lastBubbleWasMine ? 'mr-2' : 'ml-2') + '">' + pills + '</div></div>');
            return;
        }
        if (it.type === 'typing') {
            prev = null; lastBubbleWasMine = false;
            thread.push('<div class="d-flex align-items-end mb-1">' + chatAvatar(get(it.sender), 30) +
                '<div class="rounded px-3 py-1" style="background-color: ' + T.inBg + '; border: 1px solid ' + T.inBorder +
                '; color: ' + T.muted + '; font-size: 1.1em; letter-spacing: 2px; line-height: 1.2;">&middot;&middot;&middot;</div></div>');
            return;
        }
        if (it.type !== 'msg') return;

        const mine = !!(doc.me && it.sender === doc.me);
        const first = prev !== it.sender;
        prev = it.sender; lastBubbleWasMine = mine;
        const c = get(it.sender), tags = it.tags;
        const wide = ('img' in tags) || ('voice' in tags) || ('poll' in tags);
        const bg = mine ? T.outBg : T.inBg, bd = mine ? T.outBorder : T.inBorder, mu = mine ? T.outMuted : T.muted;
        let inner = '';

        if (!mine && first) inner += '<div style="font-size: 0.78em; font-weight: bold; color: ' + c.name + ';">' + chatEsc(it.sender) + '</div>';
        if ('forwarded' in tags) inner += '<div class="font-italic" style="font-size: 0.72em; color: ' + mu + ';">&#8631; Forwarded</div>';
        if ('reply' in tags) {
            const rm = tags.reply.match(/^(.+?)\s*:\s*(.*)$/), rn = rm ? rm[1] : '', rt = rm ? rm[2] : tags.reply, rc = get(rn);
            inner += '<div class="rounded px-2 py-1 mb-1" style="background-color: ' + T.quoteBg + '; border-left: 3px solid ' + rc.avatar + '; font-size: 0.8em; line-height: 1.3;">' +
                (rn ? '<div style="font-weight: bold; color: ' + rc.name + ';">' + chatEsc(rn) + '</div>' : '') +
                '<div style="color: ' + mu + ';">' + chatFmt(rt, cast) + '</div></div>';
        }
        if ('link' in tags) {
            const lp = tags.link.split(/\s*\|\s*/);
            inner += '<div class="rounded px-2 py-1 mb-1" style="background-color: ' + T.quoteBg + '; border-left: 3px solid ' + T.pollFill + '; font-size: 0.8em; line-height: 1.3;">' +
                '<div style="font-weight: bold; color: ' + T.text + ';">' + chatEsc(lp[0] || '') + '</div>' +
                (lp[1] ? '<div style="color: ' + mu + ';">' + chatEsc(lp[1]) + '</div>' : '') +
                (lp[2] ? '<div style="color: ' + mu + '; font-size: 0.9em;">' + chatEsc(lp[2]) + '</div>' : '') + '</div>';
            if (it.text) inner += '<div style="font-size: 0.95em; line-height: 1.4; color: ' + T.link + '; text-decoration: underline;">' + chatEsc(it.text) + '</div>';
        }
        if ('img' in tags) {
            inner += '<div class="embed-responsive embed-responsive-4by3 rounded" style="background-color: ' + T.imgMatte + ';"><img class="embed-responsive-item" src="' + chatEsc(tags.img) + '" alt="" /></div>';
            if (it.text) inner += '<div class="pt-1" style="font-size: 0.9em; line-height: 1.4;">' + chatFmt(it.text, cast) + '</div>';
        }
        if ('voice' in tags) {
            inner += '<div class="d-flex align-items-center mt-1"><div class="mr-2" style="font-size: 1.1em; line-height: 1; color: ' + T.text + ';">&#9654;&#65038;</div>' +
                chatBar(35, T.barFill, T) + '<div class="ml-2" style="font-size: 0.72em; color: ' + mu + ';">' + chatEsc(tags.voice || '0:00') + '</div></div>';
        }
        if ('poll' in tags) {
            const parts = tags.poll.split(/\s*\|\s*/), q = parts.shift() || '';
            const opts = parts.map((o) => { const om = o.match(/^(.*?)\s*(\d+)?$/); return { label: om[1], n: parseInt(om[2] || '0', 10) }; });
            const total = opts.reduce((s, o) => s + o.n, 0);
            inner += '<div style="font-size: 0.72em; color: ' + mu + '; font-family: \'courier new\', monospace; letter-spacing: 1px;">POLL</div>' +
                '<div class="mb-2" style="font-size: 0.95em; line-height: 1.4;">' + chatFmt(q, cast) + '</div>';
            opts.forEach((o) => {
                inner += '<div class="mb-1" style="font-size: 0.82em;"><div class="d-flex justify-content-between"><span>' + chatEsc(o.label) +
                    '</span><span style="color: ' + mu + ';">' + o.n + '</span></div>' +
                    '<div class="progress" style="height: 4px; background-color: ' + T.bar + ';"><div class="progress-bar" style="width: ' +
                    (total ? Math.round(o.n / total * 100) : 0) + '%; background-color: ' + T.pollFill + ';"></div></div></div>';
            });
            inner += '<div style="font-size: 0.66em; color: ' + mu + ';">' + total + ' vote' + (total === 1 ? '' : 's') + '</div>';
        }
        if ('deleted' in tags) {
            inner += '<div class="font-italic" style="font-size: 0.9em; color: ' + mu + ';">&#8856; This message was deleted</div>';
        } else if (it.text && !('img' in tags) && !('link' in tags)) {
            inner += '<div style="font-size: 0.95em; line-height: 1.4;">' + chatFmt(it.text, cast) + '</div>';
        }

        let meta = '';
        if ('edited' in tags) meta += '<span class="font-italic">Edited</span>' + (it.time ? ' &middot; ' : '');
        meta += chatEsc(it.time);
        if (mine) {
            const st = ('sent' in tags) ? 'sent' : ('delivered' in tags) ? 'delivered' : 'read';
            meta += (meta ? ' ' : '') + '<span style="color: ' + (st === 'read' ? T.ticks : T.muted) + ';">' +
                (st === 'sent' ? '&#10003;' : '&#10003;&#10003;') + '</span>';
        }
        if (meta) inner += '<div class="text-right" style="font-size: 0.66em; color: ' + mu + ';">' + meta + '</div>';

        const bubble = '<div class="rounded ' + (wide ? 'p-2' : 'px-2 py-1') + '" style="background-color: ' + bg + '; border: 1px solid ' + bd +
            '; color: ' + T.text + '; max-width: 78%;' + (wide ? ' width: 78%;' : ' word-wrap: break-word;') + '">' + inner + '</div>';
        if (mine) thread.push('<div class="d-flex justify-content-end mb-1">' + bubble + '</div>');
        else thread.push('<div class="d-flex align-items-end mb-1">' + (first ? chatAvatar(c, 30) : chatSpacer()) + bubble + '</div>');
    });

    const members = doc.members || doc.order.join(', ');
    const html = banners.join('\n') +
        '<div class="container mb-4" style="max-width: 420px;">\n' +
        '<div class="rounded" style="background-color: ' + T.bg + '; border: 1px solid ' + T.border + '; color: ' + T.text + ';">\n' +
        '<div class="d-flex align-items-center px-3 py-2" style="background-color: ' + T.headBg + '; color: ' + T.headSub + ';">' +
        '<div class="mr-2" style="font-size: 1.4em; line-height: 1;">&#8249;</div>' +
        '<div class="rounded-circle d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style="width: 38px; height: 38px; background-color: ' + T.headAvatar +
        '; color: ' + T.headAvatarText + '; font-family: georgia,serif; font-size: 1.1em;">' + chatEsc(String(doc.group).charAt(0).toUpperCase()) + '</div>' +
        '<div style="line-height: 1.25; min-width: 0;"><div style="font-family: georgia,serif; font-size: 1.05em; color: ' + T.headText + ';">' + chatEsc(doc.group) + '</div>' +
        '<div class="text-truncate" style="font-size: 0.72em; color: ' + T.headSub + ';">' + chatEsc(members) + '</div></div></div>\n' +
        '<div class="px-2 pt-3 pb-2">\n' + thread.join('\n') + '\n</div>\n' +
        '<div class="d-flex align-items-center px-2 py-2" style="background-color: ' + T.footBg + '; border-top: 1px solid ' + T.border + ';">' +
        '<div class="flex-grow-1 rounded-pill px-3 py-1" style="background-color: ' + T.inputBg + '; border: 1px solid ' + T.inputBorder +
        '; color: ' + T.muted + '; font-size: 0.9em;">Message</div>' +
        '<div class="rounded-circle d-flex align-items-center justify-content-center ml-2 flex-shrink-0" style="width: 34px; height: 34px; background-color: ' + T.sendBg +
        '; color: #ffffff; font-size: 0.9em;">&#10148;&#65038;</div></div>\n' +
        '</div>\n</div>\n';
    return { html: html, page: T.page };
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

// The preview frame is written once and kept. After that only the mount's
// contents change, so Bootstrap is fetched a single time however much you type.
function chatMount() {
    const frame = document.getElementById('chatPreview');
    if (!frame) return null;
    const d = frame.contentDocument;
    if (!d) return null;
    let mount = d.getElementById('mount');
    if (!mount) {
        d.open();
        d.write('<!doctype html><html><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<link rel="stylesheet" href="' + CHAT_BOOTSTRAP + '">' +
            '<style>body { margin: 0; padding: 16px 4px; } img { height: auto !important; }</style>' +
            '</head><body><div id="mount"></div></body></html>');
        d.close();
        mount = d.getElementById('mount');
    }
    return mount;
}

function chatSizeFrame() {
    const frame = document.getElementById('chatPreview');
    if (!frame || !frame.contentDocument || !frame.contentDocument.body) return;
    // Pictures arrive after the HTML does, so measure again once they land.
    const h = frame.contentDocument.body.scrollHeight;
    frame.style.height = Math.max(320, h + 24) + 'px';
}

function chatUpdate() {
    const box = document.getElementById('chatScript'), out = document.getElementById('chatOut');
    if (!box || !out) return;
    const r = chatRender(chatParse(box.value));
    out.value = r.html;
    const mount = chatMount();
    if (mount) {
        mount.ownerDocument.body.style.backgroundColor = r.page;
        mount.innerHTML = r.html;
        chatSizeFrame();
        // An image finishing its download changes the height, so measure again.
        Array.prototype.forEach.call(mount.querySelectorAll('img'), (img) => {
            img.addEventListener('load', chatSizeFrame);
            img.addEventListener('error', chatSizeFrame);
        });
    }
    try { localStorage.setItem(CHAT_KEY, box.value); } catch (e) { /* private mode, not fatal */ }
}

// Typing redraws the whole thread, so wait for a pause rather than doing it on
// every keystroke.
let _chatTimer = null;
function chatQueueUpdate() {
    if (_chatTimer) clearTimeout(_chatTimer);
    _chatTimer = setTimeout(() => { _chatTimer = null; chatUpdate(); }, 180);
}

function chatCopy() {
    const out = document.getElementById('chatOut');
    if (!out) return;
    const done = () => { if (window.toast) window.toast('Copied. Paste it into the editor’s source view, the <> button.', 'success', 5000); };
    const fallback = () => { out.select(); try { document.execCommand('copy'); } catch (e) { /* nothing else to try */ } done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, fallback);
    else fallback();
}

function chatDownload() {
    const out = document.getElementById('chatOut');
    if (!out) return;
    const blob = new Blob([out.value], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'group-chat.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function chatReset() {
    const box = document.getElementById('chatScript');
    if (!box) return;
    if (!confirm('Replace what you have written with the example?')) return;
    box.value = CHAT_EXAMPLE;
    chatUpdate();
}

let _chatStarted = false;
function showChat() {
    const box = document.getElementById('chatScript');
    if (!box) return;
    if (!_chatStarted) {
        _chatStarted = true;
        let saved = null;
        try { saved = localStorage.getItem(CHAT_KEY); } catch (e) { /* private mode */ }
        box.value = saved || CHAT_EXAMPLE;
        box.addEventListener('input', chatQueueUpdate);
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
        bind('chatCopyBtn', chatCopy);
        bind('chatDownloadBtn', chatDownload);
        bind('chatResetBtn', chatReset);
    }
    chatUpdate();
}

window.showChat = showChat;
