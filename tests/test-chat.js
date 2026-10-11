// The group chat builder: does a script turn into the markup it should.
const { load, suite } = require('./harness');
const A = load(['chat.js'], '{ chatParse, chatRender, chatFmt, CHAT_EXAMPLE, CHAT_THEMES }');
const t = suite('chat');
const ok = (l, c) => t.ok(l, c);
const build = s => A.chatRender(A.chatParse(s));
const count = (h, re) => (h.match(re) || []).length;

// --- settings -------------------------------------------------------------
let d = A.chatParse('group: Thursday lot\nme: Tealeaf\ntheme: dark\ncast: Tealeaf = gold\ncast: Sunday = red, S');
ok('group name read', d.sections[0].name === 'Thursday lot');
ok('me read', d.me === 'Tealeaf');
ok('theme read', d.theme === 'dark');
ok('cast order kept', d.order.join() === 'Tealeaf,Sunday');
ok('cast colour read', d.cast.Sunday.colour === 'red');
ok('avatar letters can be chosen', d.cast.Sunday.initial === 'S');
ok('avatar letter defaults to the first', d.cast.Tealeaf.initial === 'T');
ok('a comment line is ignored', A.chatParse('# hello\ngroup: X').sections[0].items.length === 0);

// A cast line can carry a full name, which only feeds the line under the
// group name, and that full name may contain commas of its own.
d = A.chatParse('cast: Moon = white, M, i am not your autumn moon, really');
ok('full name read', d.cast.Moon.full === 'i am not your autumn moon, really');
ok('and does not eat the avatar letters', d.cast.Moon.initial === 'M');
ok('a cast line can be just a name', A.chatParse('cast: Solo').cast.Solo.colour === 'grey');

// --- themes ---------------------------------------------------------------
['paper', 'dark', 'green', 'goth'].forEach((name) => {
    const r = build('theme: ' + name + '\ngroup: G\ncast: A = red\nA: hi');
    ok(name + ' theme renders', r.html.indexOf(A.CHAT_THEMES[name].headBg) !== -1);
    ok(name + ' theme sets a page colour', r.page === A.CHAT_THEMES[name].page);
});
ok('emo is goth', build('theme: emo\ngroup: G').page === A.CHAT_THEMES.goth.page);
ok('an unknown theme falls back to paper', build('theme: nonsense\ngroup: G').page === A.CHAT_THEMES.paper.page);
// goth is the only theme that restyles the header, so check it actually does.
const goth = build('theme: goth\ngroup: no leaving\ncast: A = red\nA: hi').html;
ok('goth sets the header in monospace', goth.indexOf("font-family: 'courier new', monospace; font-size: 1.05em") !== -1);
ok('goth puts the header in caps', goth.indexOf('class="text-uppercase" style="font-family') !== -1);
ok('paper does not', build('group: G\ncast: A = red\nA: hi').html.indexOf('text-uppercase" style="font-family') === -1);

// --- message shapes -------------------------------------------------------
const S = ['group: G', 'me: Me', 'cast: Me = gold', 'cast: You = blue',
    '--- Thursday', '--- unread 3', '* Me added You', '! Missed call from You',
    'You 10:00: hello', 'You: again', 'Me 10:01: hi', '+ ❤ 2', 'typing: You'].join('\n');
const r = build(S).html;
ok('date divider', r.indexOf('Thursday') !== -1);
ok('unread line is pluralised', r.indexOf('3 unread messages') !== -1);
ok('unread 1 is not', build('--- unread 1').html.indexOf('1 unread message<') !== -1);
ok('system line', r.indexOf('Me added You') !== -1);
ok('alert line uses the alert colour', r.indexOf(A.CHAT_THEMES.paper.alertBg) !== -1);
ok('my message sits right', r.indexOf('justify-content-end') !== -1);
ok('a reaction renders', r.indexOf('❤ 2') !== -1);
ok('typing bubble', r.indexOf('&middot;&middot;&middot;') !== -1);
ok('a run of messages names the sender once', count(r, />You<\/div>/g) === 1);
const runs = build('group: G\ncast: A = red\nA: one\nA: two\nA: three').html;
ok('a run of three messages draws one avatar', count(runs, /width: 30px; height: 30px/g) === 1);
ok('and two spacers where the others would be', count(runs, /style="width: 30px;"/g) === 2);

// --- a cast name that looks like a keyword --------------------------------
const clash = A.chatParse('group: G\nme: Me\ncast: Me = gold\ncast: You = blue\nMe: mine\nYou: yours');
ok('a character called Me is still the me: setting', clash.me === 'Me');
ok('and "Me: mine" is a message, not a setting', clash.sections[0].items.filter(i => i.type === 'msg').length === 2);
ok('that message sits on the right', build('group: G\nme: Me\ncast: Me = gold\nMe: mine').html.indexOf('justify-content-end') !== -1);
ok('a keyword nobody is called still works', A.chatParse('Theme: dark').theme === 'dark');

// --- several chats in one piece -------------------------------------------
let p = A.chatParse('group: First\nA: one\n=== group: Second\nA: two');
ok('a === starts a second chat', p.sections.length === 2);
ok('the first chat keeps its name', p.sections[0].name === 'First');
ok('the second gets its own', p.sections[1].name === 'Second');
ok('and its own messages', p.sections[1].items.length === 1);
// A script that opens with === should not leave an empty phone above it.
p = A.chatParse('cast: A = red\n=== group: Only\nA: hi');
ok('a leading === does not leave an empty chat', p.sections.length === 1);
ok('settings before it still apply', p.order.join() === 'A');
const two = build('cast: A = red\ncast: B = blue\n=== group: One\nA: hi\n=== group: Two\nB: hi').html;
ok('two chats render two phones', count(two, /max-width: 420px/g) === 2);
ok('both headers appear', two.indexOf('>One<') !== -1 && two.indexOf('>Two<') !== -1);

// --- one to one chats -----------------------------------------------------
const dm = A.chatParse('cast: Nightmare = pink, N, we are the nightmare\ncast: Dead = grey, D, leave me for dead\n' +
    '=== dm: Nightmare, Dead\nDead: hop-a-long sure moves fast\nNightmare: unfit?');
ok('a dm is its own kind of section', dm.sections[0].type === 'dm');
ok('a dm knows who is in it', dm.sections[0].people.join() === 'Nightmare,Dead');
const dmh = A.chatRender(dm).html;
ok('the second person holds the phone', dmh.indexOf('justify-content-end') !== -1);
ok('the other one is in the header', dmh.indexOf('>Nightmare<') !== -1);
ok('their full name is the subtitle', dmh.indexOf('we are the nightmare') !== -1);
ok('their avatar letter is in the header', dmh.indexOf('>N</div>') !== -1);
ok('no avatars on the bubbles', count(dmh, /width: 30px; height: 30px/g) === 0);
ok('no spacers either', count(dmh, /style="width: 30px;"/g) === 0);
ok('and no sender names', dmh.indexOf('font-weight: bold; color:') === -1 || dmh.indexOf('>Dead</div>') === -1);
// me: picks a side when it names one of the two.
const dmMe = A.chatRender(A.chatParse('me: Nightmare\ncast: Nightmare = pink\ncast: Dead = grey\n' +
    '=== dm: Nightmare, Dead\nNightmare: mine')).html;
ok('me: overrides who holds the phone', dmMe.indexOf('justify-content-end') !== -1);
ok('and the other one is in the header', dmMe.indexOf('>Dead<') !== -1);
// A me: straight after a === belongs to that chat only.
const scoped = A.chatParse('me: A\ncast: A = red\ncast: B = blue\n=== group: One\n=== group: Two\nme: B');
ok('a me: before any === is the default', scoped.me === 'A');
ok('a me: after one is scoped to that chat', scoped.sections[1].me === 'B');
ok('and does not leak to the others', !scoped.sections[0].me);

// --- the line under the group name ----------------------------------------
const subs = build('group: G\ncast: A = red, A, Aaron the first\ncast: B = blue, B, Bea the second\nA: hi').html;
ok('a group lists the full names', subs.indexOf('Aaron the first, Bea the second') !== -1);
ok('members: overrides it', build('group: G\nmembers: just us\ncast: A = red, A, Aaron\nA: hi').html.indexOf('just us') !== -1);
ok('someone with no full name falls back to their chat name',
   build('group: G\ncast: A = red\nA: hi').html.indexOf('>A</div>') !== -1);

// --- tags -----------------------------------------------------------------
const tagged = build(['group: G', 'me: Me', 'cast: Me = gold', 'cast: You = blue',
    'You: [reply Me: earlier thing] replying',
    'You: [img https://example.com/a.png] a caption',
    'You: [voice 1:47]',
    'You: [poll Q | Yes 3 | No 1]',
    'You: [link Title | blurb | site.name] https://site.name',
    'You: [forwarded] passed on',
    'You: [deleted]',
    'You: [edited] changed',
    'Me: [sent] mine',
    'Me: [delivered] mine too',
    'Me: mine as well'].join('\n')).html;
ok('reply quotes the earlier line', tagged.indexOf('earlier thing') !== -1);
ok('image renders with its source', tagged.indexOf('src="https://example.com/a.png"') !== -1);
ok('image caption renders', tagged.indexOf('a caption') !== -1);
ok('voice note shows its length', tagged.indexOf('1:47') !== -1);
ok('poll counts the votes', tagged.indexOf('4 votes') !== -1);
ok('poll works out a percentage', tagged.indexOf('width: 75%') !== -1);
ok('link preview renders', tagged.indexOf('site.name') !== -1);
ok('forwarded marker', tagged.indexOf('Forwarded') !== -1);
ok('deleted message', tagged.indexOf('This message was deleted') !== -1);
ok('edited marker', tagged.indexOf('Edited') !== -1);
ok('one tick for sent', count(tagged, />&#10003;</g) === 1);
ok('two ticks otherwise', count(tagged, /&#10003;&#10003;/g) === 2);

// --- a photo described rather than linked ---------------------------------
['photo', 'pic', 'selfie', 'video'].forEach((tag) => {
    const h = build('group: G\ncast: A = red\nA: [' + tag + ' a hoof, the polish chipped] caption here').html;
    ok(tag + ' makes a described block', h.indexOf('a hoof, the polish chipped') !== -1);
    ok(tag + ' is labelled ' + (tag === 'video' ? 'video' : 'photo'),
       h.indexOf('>' + (tag === 'video' ? 'video' : 'photo') + '</div>') !== -1);
    ok(tag + ' keeps its caption', h.indexOf('caption here') !== -1);
    ok(tag + ' needs no image tag', h.indexOf('<img') === -1);
    ok(tag + ' takes the wide bubble', h.indexOf('width: 78%') !== -1);
});
ok('a described photo takes formatting', build('group: G\ncast: A = red\nA: [photo *very* blurry]').html.indexOf('<strong>very</strong>') !== -1);

// --- inline formatting ----------------------------------------------------
const cast = { Sunday: { name: '#a8291f' } };
ok('bold', A.chatFmt('he is *always* late', cast).indexOf('<strong>always</strong>') !== -1);
ok('italic', A.chatFmt('he is _always_ late', cast).indexOf('<em>always</em>') !== -1);
ok('struck', A.chatFmt('~nope~', cast).indexOf('<s>nope</s>') !== -1);
ok('line break', A.chatFmt('one // two', cast).indexOf('<br />') !== -1);
ok('mention is coloured', A.chatFmt('@Sunday hi', cast).indexOf('#a8291f') !== -1);
const pair = { Dead: { name: '#111111' }, Deadweight: { name: '#222222' } };
ok('the longer mention wins', A.chatFmt('@Deadweight hi', pair).indexOf('#222222') !== -1);

// --- escaping -------------------------------------------------------------
const nasty = build('group: <script>bad</script>\ncast: A = red\nA: <img onerror=alert(1)>');
ok('the group name is escaped', nasty.html.indexOf('<script>bad') === -1);
ok('message markup is escaped', nasty.html.indexOf('<img onerror') === -1);
ok('escaped text is still there', nasty.html.indexOf('&lt;img onerror') !== -1);
ok('a described photo is escaped too',
   build('group: G\ncast: A = red\nA: [photo <script>x</script>]').html.indexOf('<script>x') === -1);

// --- unreadable lines are reported, not dropped ---------------------------
ok('a line that parses as nothing is flagged',
   build('group: G\nthis line has no colon').html.indexOf("couldn't read this line") !== -1);

// --- the example itself ---------------------------------------------------
const ex = build(A.CHAT_EXAMPLE);
ok('the example has no unreadable lines', ex.html.indexOf("couldn't read this line") === -1);
ok('the example renders both of its chats', count(ex.html, /max-width: 420px/g) === 3); // 2 phones + 1 banner
ok('the example opens on the dm', ex.html.indexOf('>Nightmare<') < ex.html.indexOf('the world is on fire'));
ok('the example renders a banner', ex.html.indexOf("it's been AGES") !== -1);
ok('the example renders the footer', ex.html.indexOf('>Message<') !== -1);
ok('the example is Bootstrap markup, as the editor needs',
   ex.html.indexOf('class="container') !== -1 && ex.html.indexOf('rounded-pill') !== -1);
ok('nothing in the output needs a stylesheet of ours', ex.html.indexOf('<style') === -1);

t.report();
