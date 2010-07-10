package de.deepamehta.plugins.workspaces.migrations;

import de.deepamehta.core.model.DataField;
import de.deepamehta.core.model.TopicType;
import de.deepamehta.core.service.Migration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;



public class Migration1 extends Migration {

    @Override
    public void run() {
        addWorkspacesFieldToAllTypes();
        createWorkspaceTopicType();
    }

    // ---

    private void addWorkspacesFieldToAllTypes() {
        DataField workspacesField = new DataField("Workspaces");
        workspacesField.setUri("de/deepamehta/core/property/Workspaces");
        workspacesField.setDataType("relation");
        workspacesField.setRelatedTypeUri("de/deepamehta/core/topictype/Workspace");
        workspacesField.setEditor("checkboxes");
        // workspacesField.setIndexingMode("FULLTEXT_KEY");
        //
        for (String typeUri : dms.getTopicTypeUris()) {
            dms.addDataField(typeUri, workspacesField);
        }
    }

    private void createWorkspaceTopicType() {
        DataField nameField = new DataField("Name");
        nameField.setUri("de/deepamehta/core/property/Name");
        nameField.setDataType("text");
        nameField.setEditor("single line");
        // nameField.setIndexingMode("FULLTEXT_KEY");
        //
        DataField descriptionField = new DataField("Description");
        descriptionField.setUri("de/deepamehta/core/property/Description");
        descriptionField.setDataType("html");
        descriptionField.setEditor("multi line");
        // nameField.setIndexingMode("FULLTEXT_KEY");
        //
        List dataFields = new ArrayList();
        dataFields.add(nameField);
        dataFields.add(descriptionField);
        //
        Map properties = new HashMap();
        properties.put("de/deepamehta/core/property/TypeURI", "de/deepamehta/core/topictype/Workspace");
        properties.put("de/deepamehta/core/property/TypeName", "Workspace");
        properties.put("icon_src", "/de.deepamehta.3-workspaces/images/star.png");
        properties.put("implementation", "PlainDocument");
        //
        dms.createTopicType(properties, dataFields);
    }
}
