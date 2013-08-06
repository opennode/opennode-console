from __future__ import absolute_import

import logging
import os
import pkg_resources
import re
from ConfigParser import Error as ConfigKeyError

import opennode.onc

from grokcore.component import context, implements, Adapter, Subscription
from grokcore.security import require

from twisted.web.server import NOT_DONE_YET
from twisted.web.static import File

from opennode.oms.endpoint.httprest.base import IHttpRestView, IHttpRestSubViewFactory
from opennode.oms.endpoint.httprest.root import MethodNotAllowed
from opennode.oms.model.model.plugins import IPlugin, PluginInfo
from opennode.oms.config import IRequiredConfigurationFiles, gen_config_file_names, get_config


log = logging.getLogger(__name__)

class OncRequiredConfigurationFiles(Subscription):
    implements(IRequiredConfigurationFiles)
    context(object)

    def config_file_names(self):
        return gen_config_file_names(opennode.onc, 'onc')


class OncPlugin(PluginInfo):
    implements(IPlugin)

    def initialize(self):
        log.debug("initializing ONC plugin")
        try:
            symlink_target = get_config().get('onc', 'symlink_target')
            relative_path = os.path.join(*(['../..']))
            symlink_source = pkg_resources.resource_filename(__name__, relative_path)
            if os.path.islink(symlink_target):
                os.unlink(symlink_target)
            os.symlink(symlink_source, symlink_target)
        except ConfigKeyError:
            pass


class OncView(object):
    implements(IHttpRestView)
    require('oms.nothing')

    def __init__(self, resource):
        self.resource = resource

    def rw_transaction(self, request):
        return False

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

    def rw_transaction(self, request):
        return False

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
    context(OncPlugin)

    def resolve(self, path, request):
        if request.method.lower() != 'get':
            raise MethodNotAllowed('Method not allowed', ('GET', ))

        if path == []:
            path = ['index.html']

        relative_path = os.path.join(*(['../..'] + path))
        filename = pkg_resources.resource_filename(__name__, relative_path)

        if os.path.join(*path) == 'config.js':
            return OncConfigView(filename)

        resource = File(filename)
        if not resource.exists():
            return

        # make sure fonts are servers with a correct mime type
        resource.contentTypes['.woff'] = 'application/x-font-woff'

        return OncView(resource)
