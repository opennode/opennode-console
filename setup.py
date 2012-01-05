from setuptools import setup, find_packages
from version import get_git_version


setup(
    name = "opennode.oms.onc",
    version = get_git_version(),
    description = """Open Node Client""",
    author = "OpenNode Developers",
    author_email = "developers@opennodecloud.com",
    packages = find_packages(),
    package_data={'opennode.onc': ['../../index.html', '../../app/**/*.*']},
    namespace_packages = ['opennode'],
    entry_points = {'oms.plugins': ['onc = opennode.onc.main:ONCPlugin']},
    install_requires = [
        "setuptools", # Redundant but removes a warning
        ],
)
