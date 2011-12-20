from __future__ import absolute_import

import os
import pkg_resources

from grokcore.component import context, name, implements, Adapter
from grokcore.security import require
from twisted.web.server import NOT_DONE_YET
from twisted.web.static import File
from opennode.oms.endpoint.httprest.base import IHttpRestView, HttpRestView, IHttpRestSubViewFactory
from opennode.oms.model.model.plugins import IPlugin, PluginInfo


class ONCPlugin(PluginInfo):
    implements(IPlugin)

    def initialize(self):
        print "[ONCPlugin] initializing plugin"


class ONCRootView(HttpRestView):
    """This view will never render, it's just used to attach the ONCViewFactory
    which will create a new ONCView depending on the sub-path.

    """

    context(ONCPlugin)
    name('root')

    # html and js have to be open.
    # We'll be able to close some parts of javascripts
    # but core stuff has to be open otherwise we cannot render
    # the ONC loging window
    require('oms.nothing')


class ONCView(object):
    implements(IHttpRestView)
    require('oms.nothing')

    def __init__(self, resource):
        self.resource = resource

    def render(self, request):
        res = self.resource.render(request)

        # if twisted returns '' it means that there was some http error
        # status code like 304 in case of If-Modified-Since header the file hasn't been modified
        # Twisted File resource doesn't close the connection, so we have to close it.
        if not res:
            request.finish()

        return NOT_DONE_YET


class ONCViewFactory(Adapter):
    implements(IHttpRestSubViewFactory)
    context(ONCRootView)

    def resolve(self, path):
        if path == []:
            path = ['index.html']

        relative_path = os.path.join(*(['../..'] + path))
        filename = pkg_resources.resource_filename(__name__, relative_path)
        resource = File(filename)
        if not resource.exists():
            return False

        return ONCView(resource)
