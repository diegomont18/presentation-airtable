# PRD: Presentation Builder for Airtable

## 1. Product Overview & Problem Statement

**Product:** An Airtable custom extension (block) that generates PowerPoint (.pptx) presentations of LinkedIn influencer profile cards from table data.

**Problem:** Teams managing influencer casting and scouting workflows in Airtable maintain lists of LinkedIn influencers with profile data (name, follower count, bio, engagement metrics, profile images). When presenting a shortlist to clients or internal stakeholders, they must manually copy-paste each influencer's details into PowerPoint slides -- a tedious, error-prone process that must be repeated whenever the candidate list changes.

**Solution:** A one-click extension inside Airtable that lets users map their influencer data fields, preview a deck of influencer profile cards, and export a polished `.pptx` file -- all without leaving Airtable.

---

## 2. User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | Casting manager | select my influencer table and map name, followers, bio, engagement, and image fields | the extension knows which data to pull into each profile card |
| 2 | Casting manager | preview influencer profile cards as slides before exporting | I can verify the deck looks correct before sharing with a client |
| 3 | Casting manager | export a .pptx deck of influencer profile cards | I can email or present a polished shortlist to clients and stakeholders |
| 4 | Casting manager | add a cover slide with a project title and subtitle | my presentation has a branded introduction before the influencer cards |
| 5 | Casting manager | have my field mappings and settings persist across sessions | I don't have to reconfigure the extension every time I open it |
| 6 | Casting manager | see formatted follower counts and engagement metrics on each card | the data is easy to read at a glance during presentations |

---

## 3. Functional Requirements

### 3.1 Data Source & Field Mapping
- Use `TablePickerSynced` to select the source table
- Use `FieldPickerSynced` for each influencer field, stored in `globalConfig`:

| Field | Type | Required |
|-------|------|----------|
| Name | Single line text | Yes |
| Followers | Number | Yes |
| Bio / Headline | Single line or long text | Yes |
| Engagement Rate | Number | Yes |
| Avg Likes | Number | Yes |
| Avg Comments | Number | Yes |
| Profile Image | Attachment | Yes |
| Profile Stats Image | Attachment | No (optional screenshot) |

- Use `useRecords()` hook to read live record data

### 3.2 Template System
Single built-in template: **Influencer Profile Card**

| Element | Position / Style |
|---------|-----------------|
| **Profile Image** | Left side or top-left, prominent |
| **Name** | Large, bold, prominent heading |
| **Followers** | Formatted count with icon/label (e.g., "12.5K followers") |
| **Bio / Headline** | Body text below name |
| **Engagement Metrics** | Small stats row (rate, avg likes, avg comments) |
| **Profile Stats Image** | Bottom or right side, displayed only if present |

### 3.3 Cover Slide
- Optional cover slide (enabled by default)
- User inputs: **Presentation Title** and **Subtitle**
- Stored in `globalConfig`

### 3.4 Preview
- In-extension HTML preview rendered from the template layout
- Paginated navigation: previous / next slide, slide counter
- Preview updates live as data or field mapping changes

### 3.5 Export
- Client-side `.pptx` generation using **pptxgenjs**
- One slide per record (plus optional cover slide)
- Triggers browser download on click

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Preview renders in < 200ms per slide for up to 200 records |
| **Bundle size** | pptxgenjs (~300 KB gzipped) is the only significant addition |
| **Compatibility** | Works in all browsers supported by Airtable (Chrome, Firefox, Safari, Edge) |
| **Persistence** | All user configuration survives page reloads via `globalConfig` |
| **No external calls** | Everything runs client-side; no server, no API keys |
| **Accessibility** | Keyboard navigation for slide preview; labels on all inputs |

---

## 5. UI/UX Flow

### User Flow
1. Open extension -> see configuration panel (left) + preview panel (right)
2. Pick table -> map influencer fields (Name, Followers, Bio, Engagement, Images)
3. Optionally edit cover slide title/subtitle
4. Preview auto-populates with influencer profile cards; navigate slides
5. Click **Export .pptx** -> file downloads

### ASCII Wireframe

```
+--------------------------------------------------------------+
|  Presentation Builder                                        |
+----------------------------+---------------------------------+
| CONFIGURATION              | PREVIEW                         |
|                            |                                 |
| Table:  [▼ Select table ]  | +-----------------------------+ |
|                            | | +------+                    | |
| Name:        [▼ Field    ] | | | IMG  |  Jane Doe          | |
| Followers:   [▼ Field    ] | | |      |  12.5K followers   | |
| Bio:         [▼ Field    ] | | +------+                    | |
| Eng. Rate:   [▼ Field    ] | |  B2B SaaS marketing leader  | |
| Avg Likes:   [▼ Field    ] | |  who helps brands scale...  | |
| Avg Comments:[▼ Field    ] | |                              | |
| Profile Img: [▼ Field    ] | |  3.2% eng | 245 likes | 18  | |
| Stats Img:   [▼ Field    ] | | +-------------------------+ | |
|                            | | | [Stats Screenshot]      | | |
| --- Cover Slide ---        | | +-------------------------+ | |
| Title:    [___________]    | +-----------------------------+ |
| Subtitle: [___________]    |  < Slide 2 of 15 >             |
|                            |                                 |
| [    Export .pptx     ]    |                                 |
+----------------------------+---------------------------------+
```

---

## 6. Technical Architecture

### Stack
- **Runtime:** Airtable Custom Extension (React 16)
- **SDK:** `@airtable/blocks` v1.18.2
- **Presentation engine:** `pptxgenjs` (to be added as dependency)
- **State persistence:** `globalConfig` via `useGlobalConfig()`

### Component Tree

```
<App>
  ├── <ConfigPanel>
  │     ├── TablePickerSynced
  │     ├── FieldPickerSynced (name)
  │     ├── FieldPickerSynced (followers)
  │     ├── FieldPickerSynced (bio)
  │     ├── FieldPickerSynced (engagementRate)
  │     ├── FieldPickerSynced (avgLikes)
  │     ├── FieldPickerSynced (avgComments)
  │     ├── FieldPickerSynced (profileImage)
  │     ├── FieldPickerSynced (statsImage)
  │     ├── CoverSlideInputs
  │     └── ExportButton
  └── <PreviewPanel>
        ├── SlidePreview (HTML render)
        └── SlideNavigator (prev/next + counter)
```

### Key Modules

| Module | Responsibility |
|--------|---------------|
| `frontend/index.js` | App entry, top-level layout |
| `frontend/ConfigPanel.js` | All configuration controls (field pickers, cover inputs, export button) |
| `frontend/PreviewPanel.js` | Slide preview + navigation |
| `frontend/templates.js` | Influencer profile card template definition |
| `frontend/exportPptx.js` | pptxgenjs integration, file generation |
| `frontend/slideRenderer.js` | Shared logic mapping template + record data -> slide elements |

### globalConfig Keys

```js
{
  selectedTableId: string,
  nameFieldId: string,
  followersFieldId: string,
  bioFieldId: string,
  engagementRateFieldId: string,
  avgLikesFieldId: string,
  avgCommentsFieldId: string,
  profileImageFieldId: string,
  statsImageFieldId: string,
  coverTitle: string,
  coverSubtitle: string,
  coverEnabled: boolean
}
```

---

## 7. Slide Template System Design

Single template: **Influencer Profile Card**. The template is a plain JS object describing positioned elements. The same coordinates drive both the HTML preview and the pptxgenjs output.

```js
{
  id: 'influencer-card',
  name: 'Influencer Profile Card',
  elements: [
    {
      type: 'image',
      source: 'profileImageField',
      x: 0.5,  y: 0.5,
      w: 2.5,  h: 2.5,
    },
    {
      type: 'text',
      source: 'nameField',
      x: 3.5,  y: 0.5,
      w: 6.0,  h: 0.8,
      fontSize: 28,
      bold: true,
    },
    {
      type: 'text',
      source: 'followersField',
      x: 3.5,  y: 1.4,
      w: 6.0,  h: 0.5,
      fontSize: 16,
      format: 'followers',   // triggers "12.5K followers" formatting
      color: '666666',
    },
    {
      type: 'text',
      source: 'bioField',
      x: 3.5,  y: 2.2,
      w: 6.0,  h: 2.0,
      fontSize: 14,
    },
    {
      type: 'metrics',
      sources: ['engagementRateField', 'avgLikesField', 'avgCommentsField'],
      labels: ['Eng. Rate', 'Avg Likes', 'Avg Comments'],
      x: 0.5,  y: 4.5,
      w: 9.0,  h: 0.6,
      fontSize: 12,
      color: '444444',
    },
    {
      type: 'image',
      source: 'statsImageField',
      x: 0.5,  y: 5.3,
      w: 9.0,  h: 2.0,
      optional: true,         // skip if field is empty
    },
  ],
}
```

**Preview renderer** converts these to absolutely-positioned `<div>` elements scaled to the preview container.

**Export renderer** maps each element to a `slide.addText()` or `slide.addImage()` pptxgenjs call using the same coordinates.

---

## 8. Export Format Details

- **Format:** Office Open XML Presentation (.pptx)
- **Library:** pptxgenjs (latest stable, ~v3.x)
- **Slide dimensions:** 10 x 7.5 inches (standard 4:3) -- configurable in future
- **Image handling:** Attachment URLs from Airtable fetched as base64 before embedding
- **File naming:** `{coverTitle || tableName}_presentation.pptx`

### Export Flow
1. Build `PptxGenJS` instance
2. If cover enabled, add cover slide with title + subtitle
3. For each record, create a slide using influencer card template coordinates
4. Call `pptx.writeFile()` to trigger browser download

---

## 9. MVP vs Future Scope

### MVP (v1)
- Table & field pickers for all influencer fields with synced persistence
- Influencer Profile Card template
- Cover slide with title/subtitle
- HTML slide preview with navigation
- Formatted follower counts and engagement metrics
- .pptx export via pptxgenjs

### Future (v2+)
- Custom color themes / branding
- 16:9 slide ratio option
- View-based filtering (only export records in a specific view)
- Multiple card layout variants
- Slide notes from a field
- Batch image handling optimizations
- Comparison/summary slides with aggregate stats
- PDF export option

---

## 10. Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | User can select a table and map all influencer fields (name, followers, bio, engagement rate, avg likes, avg comments, profile image, stats image) | Fields persist after reload via globalConfig |
| 2 | Influencer name renders prominently on each profile card | Name appears large and bold in both preview and export |
| 3 | Follower count displays with formatted number (e.g., "12.5K followers") | Counts are human-readable, not raw numbers |
| 4 | Bio/headline text renders on the card | Text wraps properly and is readable |
| 5 | Engagement metrics display in a stats row | Rate, avg likes, avg comments all visible |
| 6 | Profile image renders on the card | Airtable attachment thumbnail displays correctly |
| 7 | Stats image is optional and renders only when present | Cards without stats images render cleanly without gaps |
| 8 | Cover slide title and subtitle are editable | Cover slide appears as first slide in preview and export |
| 9 | Preview shows accurate slide representation with navigation | Preview layout matches exported .pptx layout; slide counter is correct |
| 10 | Export produces a valid .pptx file | File opens correctly in PowerPoint, Google Slides, Keynote |
| 11 | All config persists across sessions | Reopening extension restores previous selections |
| 12 | Extension loads without errors | No console errors; renders within 2 seconds |

---

## 11. Implementation Phases

### Phase 1: Project Setup & Config Panel
- Install `pptxgenjs` dependency
- Build `ConfigPanel` with `TablePickerSynced` + all `FieldPickerSynced` controls
- Wire `globalConfig` persistence for all field mappings
- **Deliverable:** User can pick a table and map all 6+ fields; config persists across reloads

### Phase 2: Slide Data Pipeline & Preview
- Build `slideRenderer.js` to transform records into slide data objects using the influencer card template
- Build `PreviewPanel` with HTML-rendered influencer profile card
- Add slide navigation (prev/next) with slide counter
- **Deliverable:** Live preview of influencer cards rendered from real Airtable data

### Phase 3: Cover Slide
- Add cover slide inputs (title, subtitle, enable/disable toggle) to `ConfigPanel`
- Render cover slide in preview as the first slide
- **Deliverable:** Cover slide appears in preview when enabled

### Phase 4: Export to .pptx
- Build `exportPptx.js` using pptxgenjs
- Map influencer card template elements to pptxgenjs slide calls (`addText`, `addImage`)
- Handle image attachment fetching (convert Airtable URLs to base64)
- Trigger browser download on Export button click
- **Deliverable:** Clicking Export produces a valid `.pptx` with cover + influencer slides

### Phase 5: Polish & Edge Cases
- Handle missing optional fields gracefully (stats image absent, missing engagement data)
- Format follower counts (e.g., "12.5K", "1.2M")
- Format engagement metrics (percentages, abbreviations)
- Loading states and error messages for missing required fields
- **Deliverable:** Production-ready extension with polished UX
