#!/bin/sh

# move .sencha to a temporary filename
mv .sencha .sencha.bak

# generate the workspace
sencha -sdk lib/ext-4.2/ generate workspace .

# move the configuration back
rm -rf .sencha
mv .sencha.bak .sencha

# build the application
sencha app build


