# AIFOREU website preview

Static website files for the AIFOREU design preview. The development repository and its history are kept separately.

Shared organization preview: https://aiforeu.github.io/aiforeu-preview/

The previous preview at https://d0ublemm.github.io/aiforeu-preview/ is synchronized
to this repository's main branch.

## Homepage

The homepage is one night from the first screen to the last. A film of the
aircraft above the clouds opens the page. The page then travels along five lit
workplaces, one per offer (voice agents, desktop automation, workflows, traffic
planning, IVE). It states what the company stands for, opens its two areas,
lists the further offers and ends with the aircraft leaving into the morning
above the contact question. Texts come from the area pages; the example that
runs along the first three workplaces is the scenario of
`autonomous-workforce.html`. The subpage openings are described below.

- `index.html`, `assets/home-story.css`, `assets/home-story.js`: structure,
  styling and behaviour. The script pins the stage and moves the row of
  workplaces sideways with the scroll; the light and the clip are on the
  workplace in front of the visitor. The rail and the arrow keys glide straight
  to a workplace. It also lights up the statement while it is read and plays the
  other clips only while they are on screen.
- Each workplace is a white desk filmed in darkness. The page blends the film
  with `mix-blend-mode: lighten`, so its black dissolves into the page colour and
  the desk stands in the page itself.
- With reduced motion, and without scripts, the workplaces follow one another
  down the page as still pictures. On upright screens each desk sits above its
  text.
- `assets/aiforeu-home/`: all pictures and clips of the homepage and the subpages.
- The rail under the workplaces also names how the five belong together: the
  first three are the platform, the traffic software runs on it, and IVE is what
  it is all built with. The link between IVE and the platform exists in code
  (IVE extension for agent systems, programs published as tools); that the
  traffic project uses the platform and that everything was built with IVE are
  statements of the founders.

## Navigation

Every page carries the same header. `Angebote` opens one panel with all pages,
grouped by audience (companies, municipalities and planning offices, open
source) plus the project overview; the phone menu lists the same pages. The
panel is a native `<details>`, so it opens without script; `assets/navigation.js`
adds closing by Escape, by a click elsewhere and when focus leaves it. The
header markup is repeated in each HTML file: change it in all of them together.
The platform is called "Die Plattform" in the menu and on the homepage because
its product name is going to change.

## Subpages

Every subpage opens in the same night as the homepage: a dark stage with the
page's heading and, beside it, a filmed scene from the same studio (a desk, a
row of desks), or a film that fills the stage (contact: the morning flight,
company: the night flight). `assets/page-film.css` styles the stage,
`assets/page-film.js` plays its clip while it is on screen and gives the header
its light bar back once the stage has passed. Below the stage each page goes on
in its own light layout. `verkehrsai.html` keeps its own opening and shows the
junction at night with its clip. Blog articles, imprint and privacy are
unchanged.

Stylesheets, scripts, pictures and clips that change must get a new `?v=` in the
pages that link them: browsers keep the old file otherwise, and a page with new
markup and an old stylesheet falls apart.

## Projects page

`projekte.html` shows the three areas of the platform with the same desk
pictures as the homepage, and each project has one line on how it belongs to
the others.

## Generated artwork

Pictures and clips were generated with Higgsfield. The raw output and the briefs
are kept in `.higgsfield-local/`, which is not published.

- `scripts/build-home-media.sh`: rebuilds every clip as a seamless loop and takes
  each still picture from the first frame of its loop, so nothing shifts when a
  clip starts to play. Needs ffmpeg with libx264 and Python with Pillow:
  `FFMPEG=/path/to/ffmpeg PYTHON=/path/to/python scripts/build-home-media.sh`.
- The earlier homepage showed a 3D room. Its files (`assets/aiforeu-gallery/`,
  the `assets/aiforeu-gallery-*-entry.js` and `assets/aiforeu-brand-flight-entry.js`
  scripts and the `assets/gallery*.css` stylesheets) are still in the repository,
  but no page loads them.

## Source synchronization

On 16 November 2026, Michael R's film-story update (`d194c38`) was integrated
back into the development templates and assets. The earlier preview (`55da84d`)
already contained the latest local export (`d515722`); all 415 exported files
matched before integration.

`preview-version.json` identifies the integrated development revision. Rebuilding
and exporting that source preserves the published pages, navigation, versioned
assets and deferred scripts. The static workplace fallback also keeps its artwork
inside narrow screens when motion or JavaScript is disabled.

Before another export, fetch this repository and bring any direct preview edits
back into the development source. Compare the export before pushing. The
development history and unpublished source material remain separate from this
public repository.
