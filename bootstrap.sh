#!/bin/sh

if [ -z "$TEST" ] ; then
    SERVER="http://extjs.cachefly.net/"
else
    # Put the appropriate ZIP file in a sub-folder called fake-server
    # to avoid repetitive HTTP downloads during testing:
    SERVER="file://`pwd`/fake-server/"
fi

MAJOR_VERSION=4.0
MINOR_VERSION=4.0.7
ZIP="ext-${MINOR_VERSION}-gpl.zip"
FOLDER="ext-${MINOR_VERSION}-gpl"


echo "* removing any previous files"
rm -rf ext-$MAJOR_VERSION $ZIP $FOLDER

echo "* downloading ExtJS $MINOR_VERSION"
curl -O "${SERVER}${ZIP}" 2> /dev/null

echo "* unpacking"
unzip $ZIP > /dev/null

echo "* installing"
mv $FOLDER ext-$MAJOR_VERSION

echo "* done"
