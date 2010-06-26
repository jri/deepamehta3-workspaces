function dm3_workspaces() {

    css_stylesheet("/de.deepamehta.3-workspaces/style/dm3-workspaces.css")



    /**************************************************************************************************/
    /**************************************** Overriding Hooks ****************************************/
    /**************************************************************************************************/



    this.init = function() {

        var workspaces = get_all_workspaces()
        create_default_workspace()
        create_workspace_menu()
        create_workspace_dialog()

        function create_default_workspace() {
            if (!workspaces.length) {
                create_workspace("Default")
                workspaces = get_all_workspaces()
            }
        }

        function create_workspace_menu() {
            var workspace_label = $("<span>").attr("id", "workspace-label").text("Workspace")
            var workspace_menu = $("<div>").attr("id", "workspace-menu")
            var workspace_form = $("<div>").attr("id", "workspace-form").append(workspace_label).append(workspace_menu)
            $("#upper-toolbar").prepend(workspace_form)
            ui.menu("workspace-menu", workspace_selected)
            rebuild_workspace_menu(workspaces)
            update_cookie()
        }

        function create_workspace_dialog() {
            var workspace_dialog = $("<div>").attr("id", "workspace_dialog")
            var input = $("<input>").attr({id: "workspace_name", size: 30})
            workspace_dialog.append("Name:")
            workspace_dialog.append($("<form>").attr("action", "#").submit(do_create_workspace).append(input))
            $("body").append(workspace_dialog)
            $("#workspace_dialog").dialog({modal: true, autoOpen: false, draggable: false, resizable: false, width: 350,
                title: "New Workspace", buttons: {"OK": do_create_workspace}})
        }
    }

    /**
     * @param   topic   a Topic object
     */
    this.post_delete_topic = function(topic) {
        if (topic.type_id == "Workspace") {
            var workspace_id = get_workspace_id()
            rebuild_workspace_menu()
            select_menu_item(workspace_id)  // restore selection
        }
    }



    /************************************************************************************************/
    /**************************************** Custom Methods ****************************************/
    /************************************************************************************************/



    function get_all_workspaces() {
        return dmc.get_topics("Workspace")
    }

    /**
     * Returns the ID of the selected workspace.
     */
    function get_workspace_id() {
        return ui.menu_item("workspace-menu").value
    }

    function create_workspace(name) {
        return create_topic("Workspace", {Name: name})
    }

    /**
     * Invoked when the user selects a workspace.
     */
    function workspace_selected(menu_item) {
        var workspace_id = menu_item.value
        log("Workspace selected: " + workspace_id)
        update_cookie()
        if (workspace_id == "_new") {
            open_workspace_dialog()
        } else {
            reveal_topic(workspace_id)
        }
    }

    function open_workspace_dialog() {
        $("#workspace_dialog").dialog("open")
    }

    function do_create_workspace() {
        $("#workspace_dialog").dialog("close")
        var name = $("#workspace_name").val()
        var workspace_id = create_workspace(name).id
        rebuild_workspace_menu()
        select_menu_item(workspace_id)
        return false
    }

    function rebuild_workspace_menu(workspaces) {
        if (!workspaces) {
            workspaces = get_all_workspaces()
        }
        // add menu items
        ui.empty_menu("workspace-menu")
        var icon_src = get_icon_src("Workspace")
        for (var i = 0, workspace; workspace = workspaces[i]; i++) {
            ui.add_menu_item("workspace-menu", {label: workspace.label, value: workspace.id, icon: icon_src})
        }
        ui.add_menu_separator("workspace-menu")
        ui.add_menu_item("workspace-menu", {label: "New Workspace...", value: "_new", is_trigger: true})
    }

    /**
     * Selects a workspace programmatically.
     */
    function select_menu_item(workspace_id) {
        ui.select_menu_item("workspace-menu", workspace_id)
        update_cookie()
    }

    /**
     * Sets a cookie to reflect the selected workspace.
     */
    function update_cookie() {
        set_cookie("workspace_id", get_workspace_id())
    }
}
