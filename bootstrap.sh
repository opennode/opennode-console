#!/bin/sh

if [ -z "$TEST" ] ; then
    SERVER="http://cdn.sencha.com/ext/gpl/"
else
    # Put the appropriate ZIP file in a sub-folder called fake-server
    # to avoid repetitive HTTP downloads during testing:
    SERVER="file://`pwd`/fake-server/"
fi

MAJOR_VERSION=4.2
MINOR_VERSION=4.2.1
ZIP="ext-${MINOR_VERSION}-gpl.zip"


echo "* removing any previous files"
rm -rf lib/ext-$MAJOR_VERSION $FOLDER

if [ -f "$ZIP" ]; then
    INCOMPLETE=$(zipinfo -h "$ZIP" 2>&1 | grep "extra bytes at beginning or within zipfile")
fi

if ! zipinfo -h "$ZIP" >/dev/null 2>&1 ; then
    INCOMPLETE=1
fi

if [ ! -f "$ZIP" -o ! -z "$INCOMPLETE" ]; then
    echo "* downloading ExtJS $MINOR_VERSION"
    curl -# -C- -O "${SERVER}${ZIP}" || {
        echo "Failed to download ${SERVER}${ZIP}"
        exit 1
    }
fi

echo "* unpacking"
unzip $ZIP > /dev/null
FOLDER=`ls -ld ext-${MINOR_VERSION}* | grep ^d | awk '{print $9}'`

echo "* installing"
mv $FOLDER lib/ext-$MAJOR_VERSION

echo "* done"

echo "* NB: Production build requires Sencha Cmd. Get it from:"
echo "      www.sencha.com/products/sencha-cmd/download"
