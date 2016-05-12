#!/bin/bash
set -x
set -e

npm install
sudo devenv start rabbitmq
mocha -u tdd -R xunit src/component-tests/busExpectation.test.js
