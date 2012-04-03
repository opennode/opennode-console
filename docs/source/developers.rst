Setting up a development environment
====================================

OpenNode Console (ONC) is a javascript application written on ExtJS4 framework.
It acts as a frontend to OpenNode Management Server (OMS), so for development you need access to a running OMS.

Step 1: Setup development OMS
-----------------------------

 1. Install `VirtualBox <https://www.virtualbox.org/wiki/Downloads>`_ .

 2. Download and import `OMS appliance <http://opennodecloud.com/download/on-dev.ova>`_ into a VirtualBox.

 3. Setup port forwarding in Virtualbox: inside OMS VM application is configured to run on port 8080. Setup a forwarding
    to the host machine (i.e. your actual development machine) in VM configuration. `Example <http://i.imgur.com/m9HQ3.png>`_ .

 4. Login into VM (**root:opennode**), directly or by setting up another port forwarding to SSH port 22, and start OMS:
 
 .. code-block:: sh

    $ /opt/oms/bin/omsd

 5. Verify that it is working properly by browsing to 'http://localhost:10100/basicauth'
   (replace '10100' for the port you've chosen in 3). Default OMS username:password is **dev:dev**.

Step 2: Setup ONC repository
----------------------------

ONC source code is hosted on `Github <https://github.com/opennode/opennode-console>`_ . There are three options how to
clone that repository:

 * `<git@github.com:opennode/opennode-console.git>`_ (requires ssh private key present on the machine)
 * `<https://github.com/opennode/opennode-console.git>`_ (requires username:password)
 * `<git://github.com/opennode/opennode-console.git>`_ (read only)

The choice is up to you. Note however, that you must have permissions to access repository in a write mode - if you feel
that you should have them, but don't, drop a mail to info@opennodecloud.com .

To get ONC development up and running:
 
 1. Get the code:
  
 .. code-block:: sh

    $ git clone git@github.com:opennode/opennode-console.git

 2. Get ExtJS4 library:

 .. code-block:: sh

    $ cd opennode-console;
    $ ./boostrap.sh

 3. If you don't have Cygwin on Windows, you can download the code `manually <http://extjs.cachefly.net/ext-4.0.7-gpl.zip>`_.
    Unpack it to 'ext-4.0'.

 4. Create a *config.js* in the repository root. Set BACKEND_PREFIX to an endpoint of OMS, which you've setup in Step 1.

 .. code-block:: sh

    $ cd opennode-console;
    $ echo "BACKEND_PREFIX = 'http://localhost:10100/';" > config.js

 5. Serve that directory via an HTTP server -- a simple one is present in the repository: run 'python mini-server.py'.
