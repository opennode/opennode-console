import os

from setuptools import setup, find_packages
from version import get_git_version


def files(folder, exclude=[]):
    found_files = []
    for root, dirs, files in os.walk(folder):
        for f in files:
            if not any(("%s/%s" % (root, f)).startswith(e) for e in exclude):
                found_files.append((root, f))
    return found_files


def flatten_all_files(*dirs, **kwargs):
    exclude = kwargs.get('exclude', [])
    root = kwargs.get('root', '')
    all_files = []
    for d in dirs:
        for f in files(d, exclude):
            froot, fnm = f
            prefix_start = froot.find(root)
            assert prefix_start > -1, 'Impossible base root provided. Found files do not match: %s' % root
            all_files.append(("%s" % (froot[prefix_start + len(root):]), ["%s/%s" % (froot, fnm)]))
    return all_files

#
data_files = flatten_all_files('build/Onc/production/',
                    exclude=('build/Onc/production/lib/ext-4.2', 'build/Onc/production/.sass-cache'),
                    root='build/Onc/production/'
              )
data_files.append(('', ['favicon.png', 'beep.wav', 'portal.html']))

setup(
    name="opennode.oms.onc",
    version=get_git_version(),
    description="""OpenNode Console application""",
    author="OpenNode Developers",
    author_email="info@opennodecloud.com",
    packages=find_packages(),
    data_files=data_files,
    namespace_packages=['opennode'],
    zip_safe=False,  # we need to serve real files
    entry_points={'oms.plugins': ['onc = opennode.onc.main:OncPlugin']},
    install_requires=[
        "setuptools",  # Redundant but removes a warning
        "opennode.oms.core",
        "opennode.oms.knot",
        ],
    license='GPLv2',
)
