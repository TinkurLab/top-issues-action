FROM node:8-slim

LABEL "com.github.actions.name"="Top Issues Labeler"
LABEL "com.github.actions.description"="Labels issies with the most +1s"
LABEL "com.github.actions.icon"="tag"
LABEL "com.github.actions.color"="green"

LABEL "repository"="http://github.com/adamzolyak/top-issues-action"
LABEL "homepage"="http://www.tinkurlab.com"
LABEL "maintainer"="Adam Zolyak <adam@tinkurlab.com>"

ADD entrypoint.sh /action/entrypoint.sh
ADD package.json /action/package.json
ADD app.js /action/app.js
ADD helpers.js /action/helpers.js

RUN chmod +x /action/entrypoint.sh

ENTRYPOINT ["/action/entrypoint.sh"]