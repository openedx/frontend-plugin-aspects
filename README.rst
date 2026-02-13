frontend-plugin-aspects
##########################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-plugin-aspects.svg
    :target: https://github.com/openedx/frontend-plugin-aspects/blob/main/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/openedx/frontend-plugin-aspects/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/openedx/frontend-plugin-aspects/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-plugin-aspects/coverage.svg?branch=main
    :target: https://codecov.io/github/openedx/frontend-plugin-aspects?branch=main
    :alt: Codecov

Purpose
=======

This is a collection of components meant to integrate Apects into the platform UI. They are presently used in on the sidebar slots of the Authoring MFE.


Getting Started
===============

Configuration
-------------

The components are added to the Authoring MFE when `tutor-contrib-aspects`_ is used in a Tutor deployment.

.. _tutor-contrib-aspects: https://github.com/openedx/tutor-contrib-aspects

Enable In-Context Metrics
-------------------------
#. Install `tutor-contrib-aspects`_ and rebuild the edx-platform image

    .. code-block:: sh
    
       pip install tutor-contrib-aspects
       tutor plugin enable aspects
       tutor config save --set ASPECTS_ENABLE_STUDIO_IN_CONTEXT_METRICS=True
       tutor images build openedx --no-cache
       tutor images build aspects aspects-superset

Development Setup
-----------------

#. Clone *frontend-app-authoring*

   .. code-block:: sh

      git clone https://github.com/openedx/frontend-app-authoring.git

#. Clone this repo inside *frontend-app-authoring* and install it

   .. code-block::

       cd frontend-app-authoring
       git clone https://github.com/openedx/frontend-plugin-aspects.git
       npm install ./frontend-plugin-aspects

#. Create/Update the ``env.config.jsx`` file inside ``frontend-app-authoring`` with the slot definitions

    .. code-block:: jsx

       import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from "@openedx/frontend-plugin-framework";
       import {
         SidebarToggleWrapper,
         CourseHeaderButton,
         UnitActionsButton,
         AspectsSidebarProvider,
         CourseOutlineSidebar,
         UnitPageSidebar,
         SubSectionAnalyticsButton,
       } from "@openedx/frontend-plugin-aspects";
    
       const config = {
         ...process.env,
         pluginSlots: {
           "org.openedx.frontend.authoring.course_outline_sidebar.v1": {
             keepDefault: true,
             plugins: [
               {
                 op: PLUGIN_OPERATIONS.Insert,
                 widget: {
                   id: "outline-sidebar",
                   priority: 1,
                   type: DIRECT_PLUGIN,
                   RenderWidget: CourseOutlineSidebar,
                 },
               },
               {
                 op: PLUGIN_OPERATIONS.Wrap,
                 widgetId: "default_contents",
                 wrapper: SidebarToggleWrapper,
               },
             ],
           },
           "org.openedx.frontend.authoring.course_unit_sidebar.v2": {
             keepDefault: true,
             plugins: [
               {
                 op: PLUGIN_OPERATIONS.Insert,
                 widget: {
                   id: "course-unit-sidebar",
                   priority: 1,
                   type: DIRECT_PLUGIN,
                   RenderWidget: UnitPageSidebar,
                 },
               },
               {
                 op: PLUGIN_OPERATIONS.Wrap,
                 widgetId: "default_contents",
                 wrapper: SidebarToggleWrapper,
               },
             ],
           },
           "org.openedx.frontend.authoring.course_outline_header_actions.v1": {
             keepDefault: true,
             plugins: [
               {
                 op: PLUGIN_OPERATIONS.Insert,
                 widget: {
                   id: "outline-analytics",
                   type: DIRECT_PLUGIN,
                   priority: 51,
                   RenderWidget: CourseHeaderButton,
                 },
               },
             ],
           },
           "org.openedx.frontend.authoring.course_unit_header_actions.v1": {
             keepDefault: true,
             plugins: [
               {
                 op: PLUGIN_OPERATIONS.Insert,
                 widget: {
                   id: "unit-analytics",
                   type: DIRECT_PLUGIN,
                   priority: 51,
                   RenderWidget: CourseHeaderButton,
                 },
               },
             ],
           },
           "org.openedx.frontend.authoring.course_outline_unit_card_extra_actions.v1":
             {
               keepDefault: true,
               plugins: [
                 {
                   op: PLUGIN_OPERATIONS.Insert,
                   widget: {
                     id: "uni-card-my-extra-action",
                     type: DIRECT_PLUGIN,
                     priority: 51,
                     RenderWidget: UnitActionsButton,
                   },
                 },
               ],
             },
           "org.openedx.frontend.authoring.course_outline_subsection_card_extra_actions.v1":
             {
               keepDefault: true,
               plugins: [
                 {
                   op: PLUGIN_OPERATIONS.Insert,
                   widget: {
                     id: "sub-card-my-extra-action",
                     type: DIRECT_PLUGIN,
                     priority: 51,
                     RenderWidget: SubSectionAnalyticsButton,
                   },
                 },
               ],
             },
         },
       };
    
       export default config;


#. Add Authoring MFE source as a tutor mount and rebuild the MFE images

    .. code-block:: sh
    
       tutor mounts add /path/to/frontend-app-authoring
       tutor images build mfe --no-cache

#. Start the services using ``turor dev launch``, which should setup everything have the services running.
#. Edit the code in ``frontend-plugin-aspects`` to make changes and then run ``npm run build`` to update the MFE.

    .. note::
    
        As ``npm run build`` needs to be run before changes are reflected in the UI, it is recommended
        to use a file watcher like `nodemon`_ to automate this.
    
        For example: ``nodemon --watch src --exec "npm run build"``
    
    
    .. _nodemon: https://nodemon.io

Known Issues
============

N/A

Development Roadmap
===================

N/A

Getting Help
============

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-[PLACEHOLDER]/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/getting-help

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
============

Contributions are very welcome.  Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

The Open edX Code of Conduct
============================

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
======

The assigned maintainers for this component and other project details may be
found in `Backstage`_. Backstage pulls this data from the ``catalog-info.yaml``
file in this repo.

.. _Backstage: https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-plugin-aspects

Reporting Security Issues
=========================

Please do not report security issues in public.  Email security@openedx.org instead.
