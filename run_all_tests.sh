#!/bin/sh

set -e 

gulp test
gulp test-functional
gulp test-integration
cd pace-pdf/
gulp test
gulp test-integration
