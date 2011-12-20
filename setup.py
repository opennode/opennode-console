from setuptools import setup, find_packages


setup(
    name = "opennode.oms.onc",
    version = "0.0",
    description = """Open Node Client""",
    author = "OpenNode Developers",
    author_email = "developers@opennodecloud.com",
    packages = find_packages(),
    package_data={'opennode.onc': ['../../index.html', '../../app/**/*.*']},
    namespace_packages = ['opennode'],
    entry_points = {'oms.plugins': ['onc = opennode.onc.main:ONCPlugin']}
)
