# Privacy model

## Data-flow summary

```text
Microphone -> browser audio graph -> local analysis -> interface
                                      |
                                      +-> optional local IndexedDB recording/session data

Imported files -> browser file APIs -> local parser/decoder -> local project state

Explicit export -> browser download -> user's device

```

The application has no account API or synchronization path. Audio, projects, training sessions and practice goals remain local to the current browser origin.

## Data stored locally

Depending on usage, the site can persist:

- project metadata and score events;
- user settings;
- room noise calibration;
- saved recording blobs;
- training session summaries;
- weekly practice goals;
- custom instrument tunings;
- advanced audio-lab presets.

Storage is scoped to the site's browser origin.

## Data leaving the device

### Static hosting

The browser downloads application assets from the hosting origin, such as GitHub Pages.

### Analytics

The standard web deployment does not load Google Analytics or another tracking service. Microphone frames, score documents, project data and recording blobs are not sent through a telemetry integration.

### Optional speech recognition

Browser speech recognition is opt-in and is not guaranteed to be local because the browser vendor controls its implementation.

### User-initiated links

Opening a source or other external link navigates to a separate site under the user's control.

## Threat boundaries

Users and deployment operators should consider:

- any script served by the deployment origin can access application-origin browser storage;
- browser extensions may have broad page permissions;
- exported project/audio files inherit the security of the device location where they are saved;
- shared computers should not be assumed private after local data is stored.
- deleting browser site data can permanently delete local practice records that were not exported.

## Self-hosting

The static client can be hosted directly on GitHub Pages. Deployers remain responsible for HTTPS, content updates and accurately documenting any telemetry they add.
