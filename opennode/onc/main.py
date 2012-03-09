from __future__ import absolute_import

import os
import pkg_resources
import re
from ConfigParser import Error as ConfigKeyError

import opennode.onc

from grokcore.component import context, name, implements, Adapter, Subscription
from grokcore.security import require

from twisted.web.server import NOT_DONE_YET
from twisted.web.static import File

from opennode.oms.endpoint.httprest.base import IHttpRestView, HttpRestView, IHttpRestSubViewFactory
from opennode.oms.model.model.plugins import IPlugin, PluginInfo
from opennode.oms.config import IRequiredConfigurationFiles, gen_config_file_names, get_config


conf = get_config()

class OncRequiredConfigurationFiles(Subscription):
    implements(IRequiredConfigurationFiles)
    context(object)

    def config_file_names(self):
        return gen_config_file_names(opennode.onc, 'onc')


class OncPlugin(PluginInfo):
    implements(IPlugin)

    def initialize(self):
        print "[OncPlugin] initializing plugin"


class OncRootView(HttpRestView):
    """This view will never render, it's just used to attach the ONCViewFactory
    which will create a new ONCView depending on the sub-path.

    """

    context(OncPlugin)
    name('root')

    # html and js have to be open.
    # We'll be able to close some parts of javascripts
    # but core stuff has to be open otherwise we cannot render
    # the Onc login window
    require('oms.nothing')


class OncView(object):
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


class OncConfigView(object):
    implements(IHttpRestView)
    require('oms.nothing')

    def __init__(self, path):
        self.path = path

    def render(self, request):
        cfg = ''
        if os.path.exists(self.path):
            cfg = open(self.path, 'r').read()
        if not re.match('^BACKEND_PREFIX =', cfg, re.MULTILINE):
            cfg += "BACKEND_PREFIX='/'"

        request.write(cfg)
        request.finish()

        return NOT_DONE_YET


class OncViewFactory(Adapter):
    implements(IHttpRestSubViewFactory)
    context(OncRootView)

    def __init__(self, *args, **kw):
        super(Adapter, self).__init__()
        # setup symlink if defined in the configuration File
        try:
            symlink_target = conf.get('onc', 'symlink_target')
            relative_path = os.path.join(*(['../..']))
            symlink_source = pkg_resources.resource_filename(__name__, relative_path)
            if not os.path.exists(symlink_target):
                os.symlink(symlink_source, symlink_target)
            else:
                print "symlinking failed as target already exists '%s'" % symlink_target
        except ConfigKeyError:
            pass

    def resolve(self, path):
        if path == []:
            path = ['index.html']

        relative_path = os.path.join(*(['../..'] + path))
        filename = pkg_resources.resource_filename(__name__, relative_path)

        if os.path.join(*path) == 'config.js':
            return OncConfigView(filename)

        resource = File(filename)
        if not resource.exists():
            return False

        return OncView(resource)
