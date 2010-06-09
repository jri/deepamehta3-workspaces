function dm3_workspaces() {

    css_stylesheet("vendor/dm3-workspaces/style/dm3-workspaces.css")
    topic_type_icons["Workspace"] = create_image("vendor/dm3-workspaces/images/star.png")



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
            update_workspace_menu(workspaces)
        }

        function create_workspace_dialog() {
            var workspace_dialog = $("<div>").attr("id", "workspace_dialog")
            var input = $("<input>").attr({id: "workspace_name", size: 30})
            workspace_dialog.append("Name:")
            workspace_dialog.append($("<form>").submit(do_create_workspace).append(input))
            $("body").append(workspace_dialog)
            $("#workspace_dialog").dialog({modal: true, autoOpen: false, draggable: false, resizable: false, width: 350,
                title: "New Workspace", buttons: {"OK": do_create_workspace}})
        }
    }

    // Note: we use the pre_create hook to let the "Workspaces" field be saved also if the user cancels the initial editing.
    this.pre_create = function(doc) {
        if (doc.type == "Topic") {
            doc.fields.push({
                id: "Workspaces",
                model: {
                    type: "relation",
                    related_type: "Workspace"
                },
                view: {
                    editor: "checkboxes"
                }
            })
        } else {
            // TODO: handle relations too
        }
    }

    // Note: we must use the post_create hook to create the relation because at pre_create the document has no ID yet.
    this.post_create = function(doc) {
        // Note 1: we do not relate search results to a workspace. Otherwise the search result would appear
        // as relation when displaying the workspace. That's because an "Auxiliray" relation is not be
        // created if there is another relation already.
        // Note 2: we do not relate workspaces to a workspace. This would be contra-intuitive.
        if (doc.type == "Topic" && doc.topic_type != "Search Result" && doc.topic_type != "Workspace") {
            var workspace_id = get_workspace_id()
            // Note: workspace_id is undefined in case the doc is the (just created) default workspace itself.
            if (workspace_id) {
                create_relation("Relation", doc._id, workspace_id)
            }
        } else {
            // TODO: assign relations to a workspace
        }
    }

    this.post_delete = function(doc) {
        if (doc.type == "Topic" && doc.topic_type == "Workspace") {
            var workspace_id = get_workspace_id()
            update_workspace_menu()
            select_menu_item(workspace_id)  // restore selection
        }
    }



    /************************************************************************************************/
    /**************************************** Custom Methods ****************************************/
    /************************************************************************************************/



    function get_all_workspaces() {
        return get_topics_by_type("Workspace")
    }

    /**
     * Returns the ID of the currently selected workspace.
     */
    function get_workspace_id() {
        return ui.menu_item("workspace-menu").value
    }

    function create_workspace(name) {
        var fields = [
            {id: "Name",        model: {type: "text"}, view: {editor: "single line"}, content: name},
            {id: "Description", model: {type: "html"}, view: {editor: "multi line"},  content: ""}
        ]
        var workspace = create_raw_topic("Workspace", fields, {}, "PlainDocument")
        save_document(workspace)
        return workspace
    }

    function workspace_selected(menu_item) {
        var workspace_id = menu_item.value
        log("Workspace selected: " + workspace_id)
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
        var workspace_id = create_workspace(name)._id
        update_workspace_menu()
        select_menu_item(workspace_id)
        return false
    }

    function update_workspace_menu(workspaces) {
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

    function select_menu_item(workspace_id) {
        ui.select_menu_item("workspace-menu", workspace_id)
    }
}
