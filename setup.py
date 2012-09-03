import os

from setuptools import setup, find_packages
from version import get_git_version


def files(dir, exclude=[]):
    for root, dirs, files in os.walk(dir):
        for f in files:
            if not any(("%s/%s" % (root, f)).startswith(e) for e in exclude):
                yield "../../%s/%s" % (root, f)

def all_files(*dirs, **kwargs):
    exclude = kwargs.get('exclude', [])
    for d in dirs:
        for f in files(d, exclude):
            yield f

package_data = {'opennode.onc': list(all_files('app', 'css', 'theme', 'lib/ext-4.1', 'lib/novnc', 'lib/term', 'img',
                                               exclude=('lib/ext-4.1/docs', 'lib/ext-4.1/builds', 'lib/ext-4.1/build',
                                                        'lib/ext-4.1/jsbuilder', 'lib/ext-4.1/welcome')))
                + ['../../index.html', '../../favicon.ico', '../../*.js', '../../beep.wav']}

setup(
    name = "opennode.oms.onc",
    version = get_git_version(),
    description = """Open Node Client""",
    author = "OpenNode Developers",
    author_email = "developers@opennodecloud.com",
    packages = find_packages(),
    package_data=package_data,
    namespace_packages = ['opennode'],
    zip_safe=False, # we need to serve real files
    entry_points = {'oms.plugins': ['onc = opennode.onc.main:OncPlugin']},
    install_requires = [
        "setuptools", # Redundant but removes a warning
        "opennode.oms.core",
        "opennode.oms.knot",
        ],
)
