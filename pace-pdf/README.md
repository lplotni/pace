# pace-pdf

Service that generates *start numbers* as PDFs. (Potentailly it should also
generate the *certificates* but this has still not been migrated from the main
**pace** app)

## Few words about the architecture
**pace** publishes a message on the *redis* queue that is picked by
**pace-pdf** which then triggers generation of the requested start number (all
the information needed for the start number generation is provided in the
msg). As soon as the pdf is generated, it is stored in the configured directory
(``config/default.json``) that is also configured as a *docker volume* so that
the main app (**pace**) can also access the files.

## Dev setup
First do ``npm install`` to grab all the dependencies.
To start the service you can just run ``npm start`` or build the docker image
and run it: ``docker build -t pace_pdf .`` and ``docker run pace_pdf:latest``.
Remember that it needs an existing redis intence to connect to boot up.

### Tests
Just run ``npm test`` to execute all the tests.


