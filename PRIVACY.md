# Privacy

OpenVox Studio is designed as a local-first browser application.

## Core audio processing

Microphone frames used by the live studio, vocal training, tuner and analysis tools are processed through browser audio APIs and the local pitch-analysis pipeline. The application does not require an OpenVox server endpoint for audio processing.

## Local storage

OpenVox may store the following in the browser's IndexedDB or local settings storage:

- projects and scores;
- explicitly saved recordings;
- application and audio preferences;
- training sessions;
- practice goals;
- locally created instrument tunings and audio-lab presets.

The user can export project or audio files to the device. Clearing site data in the browser can remove locally stored information that has not been exported.

## No accounts or synchronization

This edition has no account service or cloud synchronization. Training-session summaries and practice goals remain in the current browser's IndexedDB storage. Clearing site data can remove them.

## Imported files

Audio, MusicXML, MIDI and OpenVox project files are read locally by the application. They are not uploaded by the core import workflow.

## Analytics and tracking

The standard web deployment does not load Google Analytics or another tracking service. Audio frames, score content, recording blobs and project data remain outside third-party analytics workflows.

Deployment operators who add their own telemetry are responsible for documenting it, obtaining any required consent and keeping private audio or project content out of analytics events.

## Optional browser speech recognition

Voice-command functionality is disabled by default. When explicitly enabled, it uses the browser's speech-recognition implementation. Depending on the browser and platform, speech recognition may use a remote browser-vendor service. This feature is therefore not classified as part of the guaranteed local audio-processing path.

## Browser permissions

Microphone and MIDI permissions are controlled by the browser. OpenVox requests them only when a feature needs them.

For a more detailed data-flow description, see [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md).
