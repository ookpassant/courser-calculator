// ===========================================================================
// Group Chat Builder
// ---------------------------------------------------------------------------
// Write a chat as plain text, get HTML to paste into a Dungeon Coursers post.
// Not in the nav. Reachable at #chat only.
//
// Three things about this tool are deliberate and easy to "fix" by mistake:
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
//
//  3. One script can hold several chats. A === line starts a new phone, so a
//     piece can cut between a group and a DM and back. The cast is shared
//     across all of them; everything else belongs to its own section.
// ===========================================================================

const CHAT_KEY = 'bloodline.chat.script.v1';
// Reset throws the whole script away, which is the one way to lose work here.
// The old one is kept under this so it can be put back.
const CHAT_BACKUP_KEY = 'bloodline.chat.backup.v1';
const CHAT_BOOTSTRAP = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css';

const CHAT_EXAMPLE = [
    '# Settings. Change these first.',
    '# "me" is whose phone we are looking at. Their messages sit on the right. Leave it out for nobody.',
    'me: Outrage',
    'theme: goth',
    '',
    '# Cast. One per line: chat name = colour, avatar letters, full name',
    '# The chat name is what shows on the bubbles. The full name only feeds the small line under the group name.',
    '# Colours: gold blue grey red purple green teal pink orange brown black white yellow navy, or a #hex.',
    '# Delete anyone who is not in this chat. Fire, Choose and Chrome are guesses at nicknames: rename them.',
    'cast: Moon = white, M, i am not your autumn moon',
    'cast: HM = orange, HM, heavy metal broke my heart',
    'cast: Bullets = brown, B, throw all your bullets in a fire and run like hell',
    'cast: Outrage = red, O, remember to start your day with outrage',
    'cast: Lead = blue, L, i know your feet are like lead but you\'ve got to get underway',
    'cast: Nightmare = pink, N, we are the nightmare that you brought to life',
    'cast: Dead = grey, D, leave me for dead and let me go',
    'cast: Fire = gold, Fi, go start a fire go start a fight',
    'cast: Tongue = yellow, T, bite your tongue \'cause it might save your life',
    'cast: Choose = purple, C, choose not to decide',
    'cast: Chrome = teal, Ch, burn your face upon the chrome',
    '',
    '# members: ...  replaces the small line under the group name (it lists the full names otherwise)',
    '',
    '# Everything below here is an example of what the builder can do. Replace it.',
    '# A piece can hold several chats. Each === line starts a new phone.',
    '',
    '=== dm: Nightmare, Dead',
    '# A one-to-one chat. The second name (Dead) holds the phone, so Dead is on the right.',
    'Dead: hop-a-long sure moves fast',
    'Nightmare: darling are you saying we\'re unfit?',
    'Dead: no',
    'Dead: just he\'s a fast sod',
    'Nightmare: [photo a hoof, held up to the camera, the polish chipped at the edge] this manicure was not made for a quick trot',
    'Dead: let\'s ask the guys',
    '',
    '=== group: the world is on fire and we are here to burn',
    '# Back to the group. "me" is Outrage here, from the setting at the top.',
    '# A lock-screen notification, shown above the phone. Delete the line if you do not want one.',
    'banner: Bullets: it\'s been AGES | 6 more messages',
    '--- Friday',
    '* HM created the group',
    '* HM added Bullets, Moon and Nightmare',
    '* Nightmare added you',
    'Bullets 01:12: it\'s been AGES since we were all together',
    'Bullets: anyone',
    'Moon 01:14: no',
    'Outrage 01:15: what',
    'Bullets 01:16: [reply Outrage: what] nothing. go back to sleep',
    '+ \u{1F480} 3',
    'Tongue 01:18: [selfie three Coursers crammed into the frame, cheek to cheek. The one at the back looks shy but is still smiling] found them first',
    '! Missed voice call from HM · 01:20',
    'HM 01:21: [voice 2:03]',
    'Chrome 01:30: [poll are we doing the thing on saturday | yes 2 | no 1 | what thing 4]',
    'ad: Juicy Berries, two for one | This week only at the Wizard\'s stall. Breeding slots sold separately. | Wizard\'s Emporium | Visit the stall',
    'Moon 01:31: [photo a blurry picture of a very large black dog, taken from too close. One ear up, one ear down]',
    'Dead 01:32: [forwarded] ten songs to cry to',
    'Dead: [deleted]',
    'Dead: [edited] eleven songs to cry to',
    'Outrage 01:33: [read] @Choose you have to pick one',
    '* Choose left',
    '* Fire changed the group name to "no leaving"',
    '--- unread 3',
    'Nightmare 02:00: darlings. *why* is this chat still going',
    'Tongue 02:01: ~dont~ ask',
    'Lead 02:02: [img https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800] a real picture, from a web address, looks like this',
    'typing: Bullets'
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
        bannerBg: 'rgba(17,27,33,0.92)', bannerBorder: '#54656f', bannerText: '#ffffff', bannerSub: '#cfe9e5' },
    goth: { dark: true, page: '#040304', bg: '#0d0b0e', border: '#2a1f24', text: '#d9d2d6', muted: '#7d6f76',
        headBg: '#140a0e', headText: '#f2e9ec', headSub: '#b02a40', headAvatar: '#7a0f1f', headAvatarText: '#f2e9ec',
        headFont: "'courier new', monospace", headCaps: true,
        inBg: '#1a1518', inBorder: '#2e2328', outBg: '#3a0c16', outBorder: '#5a1424', outMuted: '#c98a97',
        sysBg: '#121014', sysBorder: '#2a1f24', sysText: '#8d7f87', alertBg: '#2a0a10', alertBorder: '#5a1424', alertText: '#ff4d6d',
        ticks: '#ff4d6d', quoteBg: 'rgba(255,255,255,0.05)', footBg: '#0a080b', inputBg: '#1a1518', inputBorder: '#2e2328', sendBg: '#7a0f1f',
        bar: '#2e2328', barFill: '#b3122d', pollFill: '#b3122d', link: '#e06c85', imgMatte: '#000000',
        bannerBg: 'rgba(10,8,11,0.96)', bannerBorder: '#5a1424', bannerText: '#f2e9ec', bannerSub: '#b02a40' }
};
CHAT_THEMES.emo = CHAT_THEMES.goth;

// Each name gets a readable ink and a brighter avatar fill, because a colour
// that reads on a white bubble is too dark for a 30px circle and the other way
// round on the dark themes.
const CHAT_COLOURS = {
    gold: ['#8a6212', '#c08a1e'], blue: ['#5f8ea3', '#9bc3d6'], grey: ['#5c646c', '#9aa3ad'], gray: ['#5c646c', '#9aa3ad'],
    red: ['#a8291f', '#d8362a'], purple: ['#6b5a7e', '#a894bf'], green: ['#3f6b3a', '#6f9f68'], teal: ['#2a7a78', '#5fb3b0'],
    pink: ['#a53a6e', '#d97fb0'], orange: ['#b5541a', '#e08a4a'], brown: ['#6b4a2b', '#a07a55'], black: ['#222222', '#444444'],
    white: ['#777777', '#dddddd'], yellow: ['#8a7a12', '#d8c22a'], navy: ['#2b3a6b', '#5468a8']
};

// A picture can be described rather than linked, which is the usual case in a
// written piece: there is no file to host. All four words make the same block.
const CHAT_PHOTO_TAGS = ['photo', 'pic', 'selfie', 'video'];

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
    // Longest name first, or @Dead would eat the start of @Deadweight.
    Object.keys(cast).sort((a, b) => b.length - a.length).forEach((name) => {
        t = t.replace(new RegExp('@' + chatEscRe(chatEsc(name)), 'g'),
            '<span style="color: ' + cast[name].name + '; font-weight: bold;">@' + chatEsc(name) + '</span>');
    });
    t = t.replace(/\s*\/\/\s*/g, '<br />');
    return t;
}

function chatNewSection() {
    return { type: 'group', name: 'GROUP NAME', members: '', me: '', people: [], items: [] };
}

function chatParse(src) {
    const doc = { me: '', theme: 'paper', cast: {}, order: [], sections: [] };
    let cur = chatNewSection();
    doc.sections.push(cur);
    let started = false;
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

        // === starts a new phone. The very first one takes over the section
        // that is already open, so a script that opens with === does not leave
        // an empty chat above everything.
        if ((m = line.match(/^===+\s*(?:(dm|group)\s*:?\s*)?(.*?)\s*=*$/i))) {
            const type = (m[1] || 'group').toLowerCase(), rest = m[2].trim();
            if (started || cur.items.length) { cur = chatNewSection(); doc.sections.push(cur); }
            started = true;
            cur.type = type;
            if (type === 'dm') {
                cur.people = rest.split(/\s*(?:,|\band\b|&)\s*/).filter(Boolean);
                cur.name = cur.people.join(' and ');
            } else if (rest) {
                cur.name = rest;
            }
            return;
        }

        if ((m = line.match(/^(group|me|theme|members|cast|banner|typing|ad)\s*:\s*(.*)$/i))
            && (m[1] === m[1].toLowerCase() || !named[m[1].toLowerCase()])) {
            const k = m[1].toLowerCase(), v = m[2].trim();
            if (k === 'group') { cur.name = v; cur.type = 'group'; return; }
            if (k === 'members') { cur.members = v; return; }
            // A me: after a === belongs to that chat. Before any, it is the
            // default for every chat in the piece.
            if (k === 'me') { if (started) cur.me = v; else doc.me = v; return; }
            if (k === 'cast') {
                // name = colour, avatar letters, full name. The last two are
                // optional and the full name may contain commas of its own.
                const cm = v.match(/^(.+?)\s*=\s*([^,]+?)\s*(?:,\s*([^,\s]+))?\s*(?:,\s*(.+))?$/);
                if (cm) { doc.cast[cm[1]] = { colour: cm[2].trim(), initial: cm[3] || cm[1].charAt(0), full: (cm[4] || '').trim() }; doc.order.push(cm[1]); }
                else if (v) { doc.cast[v] = { colour: 'grey', initial: v.charAt(0), full: '' }; doc.order.push(v); }
            } else if (k === 'banner') {
                const bm = v.match(/^(.+?)\s*:\s*(.*?)(?:\s*\|\s*(.*))?$/);
                cur.items.push({ type: 'banner', sender: bm ? bm[1] : '', text: bm ? bm[2] : v, more: (bm && bm[3]) || '' });
            } else if (k === 'typing') {
                cur.items.push({ type: 'typing', sender: v });
            } else if (k === 'ad') {
                // headline | body | advertiser | button. Everything past the
                // headline is optional, so a one-line advert is just the text.
                const ap = v.split(/\s*\|\s*/);
                cur.items.push({ type: 'ad', title: ap[0] || '', body: ap[1] || '', who: ap[2] || '', cta: ap[3] || '' });
            } else { doc[k] = v; }
            return;
        }

        if ((m = line.match(/^---\s*unread\s+(\d+)/i))) { cur.items.push({ type: 'unread', n: m[1] }); return; }
        if ((m = line.match(/^---\s*(.*)$/))) { cur.items.push({ type: 'date', text: m[1] }); return; }
        if ((m = line.match(/^\*\s*(.*)$/))) { cur.items.push({ type: 'system', text: m[1] }); return; }
        if ((m = line.match(/^!\s*(.*)$/))) { cur.items.push({ type: 'system', alert: true, text: m[1] }); return; }
        if ((m = line.match(/^\+\s*(.*)$/))) { cur.items.push({ type: 'react', text: m[1] }); return; }
        if ((m = line.match(/^([^:[\]]+?)(?:\s+(\d{1,2}:\d{2}))?\s*:\s*(.*)$/))) {
            const msg = { type: 'msg', sender: m[1].trim(), time: m[2] || '', text: m[3], tags: {} };
            let t = msg.text, tm;
            while ((tm = t.match(/^\[(\w+)([^\]]*)\]\s*/))) { msg.tags[tm[1].toLowerCase()] = tm[2].trim(); t = t.slice(tm[0].length); }
            msg.text = t;
            if ('typing' in msg.tags) { cur.items.push({ type: 'typing', sender: msg.sender }); return; }
            cur.items.push(msg);
            return;
        }
        // Anything left is a line the parser could not place. Say so in the
        // preview rather than dropping it, or a typo just silently vanishes.
        cur.items.push({ type: 'note', text: line });
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

// One phone. A DM drops the avatars and the names on the bubbles, because in a
// two-person chat they say nothing you cannot see, and puts the other person in
// the header instead.
function chatRenderSection(sec, doc, T, cast, get) {
    const isDm = sec.type === 'dm';
    let meVal = sec.me || doc.me, other = '';
    if (isDm) {
        const ps = sec.people;
        // Whoever is named second holds the phone, unless me: picks one of them.
        if (ps.indexOf(meVal) < 0) meVal = ps[1] || ps[0] || '';
        other = ps.filter(p => p !== meVal)[0] || ps[0] || '';
    }
    const title = isDm ? other : sec.name;
    const banners = [], thread = [];
    let prev = null, lastBubbleWasMine = false;

    sec.items.forEach((it) => {
        if (it.type === 'banner') {
            banners.push(
                '<div class="container mb-3" style="max-width: 420px;">' +
                '<div class="rounded px-3 py-2" style="background-color: ' + T.bannerBg + '; color: ' + T.bannerText + '; border: 1px solid ' + T.bannerBorder + ';">' +
                '<div class="d-flex justify-content-between" style="font-family: \'courier new\', monospace; font-size: 0.7em; letter-spacing: 2px; color: ' + T.bannerSub + ';"><span>' +
                chatEsc(title).toUpperCase() + '</span><span>now</span></div>' +
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
        if (it.type === 'ad') {
            // An advert is the app talking, not a person, so it wears no
            // avatar and no bubble and sits full width, like the system lines.
            // It is marked SPONSORED because the whole joke of one of these is
            // that it turned up uninvited between two of your friends.
            prev = null;
            thread.push('<div class="rounded mb-2 px-3 py-2" style="background-color: ' + T.sysBg +
                '; border: 1px solid ' + T.sysBorder + '; color: ' + T.text + ';">' +
                '<div class="text-uppercase" style="font-family: \'courier new\', monospace; font-size: 0.62em; letter-spacing: 2px; color: ' + T.sysText + ';">Sponsored</div>' +
                (it.title ? '<div style="font-size: 0.95em; font-weight: bold; line-height: 1.35;">' + chatFmt(it.title, cast) + '</div>' : '') +
                (it.body ? '<div style="font-size: 0.86em; line-height: 1.4; color: ' + T.sysText + ';">' + chatFmt(it.body, cast) + '</div>' : '') +
                ((it.who || it.cta) ? '<div class="d-flex justify-content-between align-items-center mt-1" style="gap: 8px;">' +
                    '<span style="font-size: 0.72em; color: ' + T.muted + ';">' + chatEsc(it.who) + '</span>' +
                    (it.cta ? '<span class="rounded-pill px-2 flex-shrink-0" style="background-color: ' + T.sendBg +
                        '; color: #ffffff; font-size: 0.72em; line-height: 1.7;">' + chatEsc(it.cta) + '</span>' : '') +
                    '</div>' : '') +
                '</div>');
            return;
        }
        if (it.type === 'note') { prev = null; thread.push(chatPill('<em>(couldn\'t read this line: ' + chatEsc(it.text) + ')</em>', T, true)); return; }
        if (it.type === 'react') {
            const pills = it.text.split(/\s*,\s*/).filter(Boolean).map(r =>
                '<span class="d-inline-block rounded-pill px-2" style="background-color: ' + T.inBg + '; border: 1px solid ' + T.inBorder +
                '; color: ' + T.text + '; font-size: 0.72em; line-height: 1.6;">' + chatEsc(r) + '</span>').join(' ');
            thread.push('<div class="d-flex mb-3' + (lastBubbleWasMine ? ' justify-content-end' : '') + '" style="margin-top: -6px;">' +
                ((lastBubbleWasMine || isDm) ? '' : chatSpacer()) + '<div class="' + (lastBubbleWasMine ? 'mr-2' : 'ml-2') + '">' + pills + '</div></div>');
            return;
        }
        if (it.type === 'typing') {
            prev = null; lastBubbleWasMine = false;
            thread.push('<div class="d-flex align-items-end mb-1">' + (isDm ? '' : chatAvatar(get(it.sender), 30)) +
                '<div class="rounded px-3 py-1" style="background-color: ' + T.inBg + '; border: 1px solid ' + T.inBorder +
                '; color: ' + T.muted + '; font-size: 1.1em; letter-spacing: 2px; line-height: 1.2;">&middot;&middot;&middot;</div></div>');
            return;
        }
        if (it.type !== 'msg') return;

        const mine = !!(meVal && it.sender === meVal);
        const first = prev !== it.sender;
        prev = it.sender; lastBubbleWasMine = mine;
        const c = get(it.sender), tags = it.tags;
        const photoKey = CHAT_PHOTO_TAGS.filter(k => k in tags)[0] || null;
        const wide = ('img' in tags) || ('voice' in tags) || ('poll' in tags) || !!photoKey;
        const bg = mine ? T.outBg : T.inBg, bd = mine ? T.outBorder : T.inBorder, mu = mine ? T.outMuted : T.muted;
        let inner = '';

        if (!mine && first && !isDm) inner += '<div style="font-size: 0.78em; font-weight: bold; color: ' + c.name + ';">' + chatEsc(it.sender) + '</div>';
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
        if (photoKey) {
            inner += '<div class="rounded p-2 mb-1" style="background-color: ' + T.imgMatte + '; border: 1px dashed ' + bd +
                '; color: ' + T.muted + '; font-size: 0.82em; line-height: 1.35;">' +
                '<div class="text-uppercase" style="font-family: \'courier new\', monospace; font-size: 0.8em; letter-spacing: 2px;">' +
                (photoKey === 'video' ? 'video' : 'photo') + '</div>' +
                '<div class="font-italic">' + chatFmt(tags[photoKey], cast) + '</div></div>';
            if (it.text) inner += '<div style="font-size: 0.9em; line-height: 1.4;">' + chatFmt(it.text, cast) + '</div>';
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
        } else if (it.text && !('img' in tags) && !('link' in tags) && !photoKey) {
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
        else thread.push('<div class="d-flex align-items-end mb-1">' + (isDm ? '' : (first ? chatAvatar(c, 30) : chatSpacer())) + bubble + '</div>');
    });

    // The header. A DM wears the other person's avatar and colour; a group
    // wears the theme's and lists everybody's full name underneath.
    let sub, avBg = T.headAvatar, avFg = T.headAvatarText, avText = chatEsc(String(title).charAt(0).toUpperCase());
    if (isDm) {
        const oc = get(other);
        sub = sec.members || oc.full || '';
        avBg = oc.avatar; avFg = '#ffffff'; avText = chatEsc(oc.initial);
    } else {
        sub = sec.members || doc.order.map(n => cast[n].full || n).join(', ');
    }

    return banners.join('\n') +
        '<div class="container mb-4" style="max-width: 420px;">\n' +
        '<div class="rounded" style="background-color: ' + T.bg + '; border: 1px solid ' + T.border + '; color: ' + T.text + ';">\n' +
        '<div class="d-flex align-items-center px-3 py-2" style="background-color: ' + T.headBg + '; color: ' + T.headSub + ';">' +
        '<div class="mr-2" style="font-size: 1.4em; line-height: 1;">&#8249;</div>' +
        '<div class="rounded-circle d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style="width: 38px; height: 38px; background-color: ' + avBg +
        '; color: ' + avFg + '; font-family: georgia,serif; font-size: 1.1em;">' + avText + '</div>' +
        '<div style="line-height: 1.25; min-width: 0;"><div' + (T.headCaps ? ' class="text-uppercase"' : '') +
        ' style="font-family: ' + (T.headFont || 'georgia,serif') + '; font-size: 1.05em;' + (T.headCaps ? ' letter-spacing: 2px;' : '') +
        ' color: ' + T.headText + ';">' + chatEsc(title) + '</div>' +
        (sub ? '<div class="text-truncate" style="font-size: 0.72em; color: ' + T.headSub + ';">' + chatEsc(sub) + '</div>' : '') + '</div></div>\n' +
        '<div class="px-2 pt-3 pb-2">\n' + thread.join('\n') + '\n</div>\n' +
        '<div class="d-flex align-items-center px-2 py-2" style="background-color: ' + T.footBg + '; border-top: 1px solid ' + T.border + ';">' +
        '<div class="flex-grow-1 rounded-pill px-3 py-1" style="background-color: ' + T.inputBg + '; border: 1px solid ' + T.inputBorder +
        '; color: ' + T.muted + '; font-size: 0.9em;">Message</div>' +
        '<div class="rounded-circle d-flex align-items-center justify-content-center ml-2 flex-shrink-0" style="width: 34px; height: 34px; background-color: ' + T.sendBg +
        '; color: #ffffff; font-size: 0.9em;">&#10148;&#65038;</div></div>\n' +
        '</div>\n</div>\n';
}

function chatRender(doc) {
    const T = CHAT_THEMES[String(doc.theme || 'paper').toLowerCase()] || CHAT_THEMES.paper;
    const cast = {};
    doc.order.forEach((n) => {
        const c = doc.cast[n], key = String(c.colour).toLowerCase(), p = CHAT_COLOURS[key] || [c.colour, c.colour];
        cast[n] = { name: T.dark ? p[1] : p[0], avatar: p[1], initial: c.initial, full: c.full };
    });
    const get = n => cast[n] || { name: T.muted, avatar: T.muted, initial: String(n || '?').charAt(0), full: '' };
    return {
        html: doc.sections.map(sec => chatRenderSection(sec, doc, T, cast, get)).join('\n'),
        page: T.page
    };
}

// How long the piece is.
//
// Counting the script would be the easy thing and the wrong one: it would
// include the cast list, the tags, the URLs and the comments, none of which
// appear in the finished post. A word count is for what a reader reads, and
// on this site for what a submission is measured by, so this counts the words
// that end up on screen and nothing else.
function chatCounts(doc) {
    let words = 0, messages = 0;
    const add = (s) => {
        const found = String(s == null ? '' : s)
            .replace(/\/\//g, ' ')   // the line break marker is not a word
            .match(/\S+/g);
        if (found) words += found.length;
    };
    doc.sections.forEach((sec) => {
        sec.items.forEach((it) => {
            if (it.type === 'msg') {
                messages++;
                add(it.text);
                const tags = it.tags;
                // A quoted reply is on screen, so it counts.
                if (tags.reply) add(String(tags.reply).replace(/^[^:]*:\s*/, ''));
                CHAT_PHOTO_TAGS.forEach(k => { if (k in tags) add(tags[k]); });
                // Bars are separators and the vote tallies are numbers.
                if (tags.poll) add(String(tags.poll).replace(/\|/g, ' ').replace(/\b\d+\b/g, ' '));
                if (tags.link) add(String(tags.link).replace(/\|/g, ' '));
                return;
            }
            if (it.type === 'system' || it.type === 'date') { add(it.text); return; }
            if (it.type === 'banner') { add(it.text); add(it.more); return; }
            // An advert is on screen and you wrote it, so it counts, same as a
            // system line. The button is a label rather than prose, so it does not.
            if (it.type === 'ad') { add(it.title); add(it.body); add(it.who); return; }
        });
    });
    return { words: words, messages: messages, chats: doc.sections.length };
}

function chatCountText(c) {
    const bit = (n, one, many) => n + ' ' + (n === 1 ? one : many);
    const parts = [bit(c.words, 'word', 'words'), bit(c.messages, 'message', 'messages')];
    if (c.chats > 1) parts.push(bit(c.chats, 'chat', 'chats'));
    return parts.join(' · ');
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
    frame.style.height = Math.max(320, frame.contentDocument.body.scrollHeight + 24) + 'px';
}

function chatUpdate() {
    const box = document.getElementById('chatScript'), out = document.getElementById('chatOut');
    if (!box || !out) return;
    const doc = chatParse(box.value);
    const r = chatRender(doc);
    out.value = r.html;
    const tally = document.getElementById('chatCount');
    if (tally) tally.textContent = chatCountText(chatCounts(doc));
    const mount = chatMount();
    if (mount) {
        mount.ownerDocument.body.style.backgroundColor = r.page;
        mount.innerHTML = r.html;
        chatSizeFrame();
        // A picture arrives after the markup does, so measure again once it lands.
        Array.prototype.forEach.call(mount.querySelectorAll('img'), (img) => {
            img.addEventListener('load', chatSizeFrame);
            img.addEventListener('error', chatSizeFrame);
        });
    }
    chatStash(CHAT_KEY, box.value);
}

// Typing redraws every phone in the piece, so wait for a pause rather than
// doing it on each keystroke.
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

// Name a downloaded file after the chat it holds, since the whole point of
// keeping drafts is having several and being able to tell them apart.
function chatFileName(doc, ext) {
    const first = doc && doc.sections && doc.sections[0];
    const from = first ? (first.type === 'dm' ? first.people.join(' and ') : first.name) : '';
    const slug = String(from || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
    const d = new Date();
    const stamp = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    return (slug && slug !== 'group-name' ? slug : 'chat') + '-' + stamp + '.' + ext;
}

function chatSaveFile(text, name, mime) {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function chatDownload() {
    const out = document.getElementById('chatOut'), box = document.getElementById('chatScript');
    if (!out || !box) return;
    chatSaveFile(out.value, chatFileName(chatParse(box.value), 'html'), 'text/html');
}

// The draft is the script, saved exactly as typed so it comes back byte for
// byte. The browser only holds one script at a time, so this is how a finished
// piece gets kept.
function chatDownloadDraft() {
    const box = document.getElementById('chatScript');
    if (!box) return;
    chatSaveFile(box.value, chatFileName(chatParse(box.value), 'txt'), 'text/plain');
    if (window.toast) window.toast('Draft saved. Open it again with the button beside this one.', 'success', 5000);
}

// A download you cannot load back is a trap, so this is the way in. What was
// in the box goes to the same place Reset puts it, so Undo gets it back.
const CHAT_DRAFT_LIMIT = 1024 * 1024;
function chatOpenDraft(file) {
    const box = document.getElementById('chatScript');
    if (!box || !file) return;
    if (file.size > CHAT_DRAFT_LIMIT) {
        if (window.toast) window.toast('That file is too big to be a chat script, so I have left it alone.', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onerror = () => { if (window.toast) window.toast('That file could not be read.', 'error'); };
    reader.onload = () => {
        const text = String(reader.result == null ? '' : reader.result);
        if (box.value.trim() && box.value !== text &&
            !confirm('Replace what is in the box with ' + file.name + '? You can undo it afterwards.')) return;
        chatStash(CHAT_BACKUP_KEY, box.value);
        box.value = text;
        chatUpdate();
        chatRefreshUndo();
        if (window.toast) window.toast('Opened ' + file.name + '.', 'success');
    };
    reader.readAsText(file);
}

function chatStash(key, value) {
    try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); }
    catch (e) { /* private mode, not fatal */ }
}
function chatStashed(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

// The undo button only exists when there is something to undo.
function chatRefreshUndo() {
    const btn = document.getElementById('chatUndoBtn');
    if (btn) btn.hidden = chatStashed(CHAT_BACKUP_KEY) === null;
}

function chatReset() {
    const box = document.getElementById('chatScript');
    if (!box) return;
    if (!confirm('Replace what you have written with the example? You can undo it afterwards.')) return;
    chatStash(CHAT_BACKUP_KEY, box.value);
    box.value = CHAT_EXAMPLE;
    chatUpdate();
    chatRefreshUndo();
    if (window.toast) window.toast('Example put back. Your own script is kept, press Undo to get it again.', 'success', 6000);
}

function chatUndo() {
    const box = document.getElementById('chatScript');
    const prev = chatStashed(CHAT_BACKUP_KEY);
    if (!box || prev === null) return;
    box.value = prev;
    chatStash(CHAT_BACKUP_KEY, null);
    chatUpdate();
    chatRefreshUndo();
    if (window.toast) window.toast('Your script is back.', 'success');
}

let _chatStarted = false;
function showChat() {
    const box = document.getElementById('chatScript');
    if (!box) return;
    if (!_chatStarted) {
        _chatStarted = true;
        const saved = chatStashed(CHAT_KEY);
        box.value = saved === null ? CHAT_EXAMPLE : saved;
        box.addEventListener('input', chatQueueUpdate);
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
        bind('chatCopyBtn', chatCopy);
        bind('chatDownloadBtn', chatDownload);
        bind('chatDraftBtn', chatDownloadDraft);
        bind('chatResetBtn', chatReset);
        bind('chatUndoBtn', chatUndo);
        // The file input does the work; the button is just something to press.
        const picker = document.getElementById('chatOpenFile');
        bind('chatOpenBtn', () => { if (picker) picker.click(); });
        if (picker) picker.addEventListener('change', () => {
            chatOpenDraft(picker.files && picker.files[0]);
            // Cleared so opening the same file twice in a row still fires.
            picker.value = '';
        });
    }
    chatRefreshUndo();
    chatUpdate();
}

window.showChat = showChat;
