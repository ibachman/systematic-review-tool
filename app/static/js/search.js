var is_submit_button = false
var show_results =  function(results){

    if(! ('data' in results)){

        return
    }
    headers = results.headers
    data = results.data
    d3.select("#results-body")
    .append("h3")
    .text(data.length + " matches were found")
    table = d3.select("#results-body")
    .append("table")
    .attr("class","table table-bordered table-striped table-hover table-responsive")
    header_row = table.append("thead").append("tr")
    for(i = 0; i < headers.length; i++){
        header_row.append("td")
        .text(headers[i])
    }
    tbody = table.append("tbody")
    for(k = 0; k < data.length; k++){
        row = tbody.append("tr")
        for(i = 0; i < headers.length; i++){
            row.append("td")
            .text(data[k][headers[i]])
        }
    }
}

// Initialize search form
var set_form = function(dict){
    d3.json("/api/request/headers/paper/",
        function(error, data){
            if(error){
                        console.log(error)
            }
        // get data
        paper_properties = data.properties
        paper_properties_length = paper_properties.length
        paper_title = paper_properties[0].value
        // make form structure
        fieldset = d3.select("#form-body")
        // set checkboxes
        form_group = fieldset.append("div").attr("class","form-group")
        form_group.append("label")
        .attr("class","col-md-2 control-label")
        .attr("for","checkboxes")
        .text("Select attributes to show")
        checkbox_container = form_group.append("div")
                                .attr("class","col-md-8")
        for(k = 0; k < paper_properties_length; k++){
            name = paper_properties[k].name
            if(name != 'title'){
                checkbox_label = checkbox_container.append("label")
                .attr("class","checkbox-inline")
                .attr("id","checkbox-id-"+k)
                .attr("for","checkboxes-"+k)
                checkbox_label.append("input")
                .attr("type","checkbox")
                .attr("name","checkboxes")
                .attr("id","checkboxes-"+k)
                .attr("value",paper_properties[k].name)
                checkbox_label.append("span")
                .text(name)
            }
        }
        // set form body
        for(i = 0; i < paper_properties_length; i++){
            type = paper_properties[i].type
            element_id = "search-"+(paper_properties[i].name).replace(" ","-")
            value = get_value(dict,paper_properties[i].name)
            text_label = paper_properties[i].name
            placeholder = get_placeholder(dict,paper_properties[i].name,text_label)
            if(type == 'varchar'){
                form_group = fieldset.append("div").attr("class","form-group")
                set_varchar_input (form_group,element_id,text_label,value,placeholder)
            }
            if(type == 'text'){
                form_group = fieldset.append("div").attr("class","form-group")
                set_text_input(form_group,element_id,text_label,value,placeholder)
            }
            if(type == 'number'){
                form_group = fieldset.append("div").attr("class","form-group")
                set_number_input(form_group,element_id,text_label,value,placeholder)
            }
            if(type == 'category'){
                category_id = paper_properties[i].id
                // set form parameters for category
                d3.json('/api/request/headers/category/'+category_id,
                function(error,data){
                    if(error){
                        console.log(error)
                    }
                    text_label = data.name
                    element_id = "search-"+(text_label).replace(" ","-")
                    category_properties = data.headers
                    category_properties_length = category_properties.length
                    for(j = 0; j < category_properties_length; j++){
                        if(category_properties[j].name == 'id'){
                            continue
                        }

                        form_group = fieldset.append("div").attr("class","form-group")
                        prop_type = category_properties[j].type
                        prop_value = get_value(dict,text_label+category_properties[j].name)
                        prop_text_label = text_label +" "+ category_properties[j].name
                        prop_placeholder = get_placeholder(dict,text_label+category_properties[j].name, prop_text_label)
                        prop_element_id = element_id +"-"+ (category_properties[j].name).split(" ").join("-")
                        if(prop_type == 'varchar'){
                            set_varchar_input (form_group,prop_element_id,prop_text_label,prop_value,prop_placeholder)
                        }
                        if(prop_type == 'text'){
                            set_text_input(form_group,prop_element_id,prop_text_label,prop_value,prop_placeholder)
                        }
                        if(prop_type == 'number'){
                            set_number_input(form_group,prop_element_id,prop_text_label,prop_value,prop_placeholder)
                        }
                        if(prop_type == 'subcat'){
                            prop_text_label = prop_text_label + " name"
                            prop_placeholder = get_placeholder(dict,text_label+category_properties[j].name, prop_text_label)
                            set_text_input(form_group,prop_element_id,prop_text_label,prop_value,prop_placeholder)
                        }
                    }
                    fieldset.select("#submit-form-group").remove()
                    // add buttons
                    form_group = fieldset.append("div")
                                    .attr("class","form-group")
                                    .attr("id","submit-form-group")
                    // label?
                    form_group.append("label")
                    .attr("class","col-md-5 control-label")
                    .attr("for","accept-modified-data")
                    // buttons
                    div_for_buttons = form_group.append("div").attr("class","col-md-7")
                    put_submit_button(div_for_buttons)
                })
            }
        }
        // add buttons
                    form_group = fieldset.append("div")
                                    .attr("class","form-group")
                                    .attr("id","submit-form-group")
                    // label?
                    form_group.append("label")
                    .attr("class","col-md-5 control-label")
                    .attr("for","accept-modified-data")
                    // buttons
                    div_for_buttons = form_group.append("div").attr("class","col-md-7")
                    put_submit_button(div_for_buttons)
    })

}

var get_value = function(dict,name){
    if(name in dict){
        return dict[name]
    }
    else{
        return ""
    }
}

var get_placeholder = function(dict,name,text_label){
    if(name in dict){
        if(dict[name] != ""){
            return ""
        }
    }
    return "Instert "+text_label
}

var put_dismiss_button = function(div_for_buttons){
    div_for_buttons.append("button")
                    .attr("data-dismiss","modal")
                    .attr("class", "btn btn-danger")
                    .text("cancel")
}

var put_submit_button = function(div_for_buttons){
    div_for_buttons.append("button")
                    .attr("id","accept-new-data")
                    .attr("type","submit")
                    .attr("name","accept-new-data")
                    .attr("class", "btn btn-success")
                    .text("Accept")

}

var set_number_input = function(form_group,id,text_label,value,placeholder){
    form_group.append("label")
        .attr("class","col-md-2 control-label")
        .attr("for",id)
        .text(text_label)
    input_element = form_group.append("div")
        .attr("class","col-xs-3")
        .append("input")
        .attr("id",id)
        .attr("name",id)
        .attr("type","number")
        .attr("class","form-control input-md")
    if(placeholder == ""){
        input_element.attr("value",value)
    }
    if(value == ""){
        input_element.attr("placeholder",placeholder)
    }

}

var set_varchar_input = function(form_group,id,text_label,value,placeholder){
    form_group.append("label")
                .attr("class","col-md-2 control-label")
                .attr("for",id)
                .text(text_label)
    input_element = form_group.append("div")
                .attr("class","col-md-8")
                .append("input")
                .attr("id",id)
                .attr("name",id)
                .attr("type","text")
                .attr("class","form-control input-md")

    if(placeholder == ""){
        input_element.attr("value",value)
    }
    if(value == ""){
        input_element.attr("placeholder",placeholder)
    }

}

var set_text_input = function(form_group,id,text_label,value,placeholder){
                    form_group.append("label")
                    .attr("class","col-md-2 control-label")
                    .attr("for",id)
                    .text(text_label)
    input_element = form_group.append("div")
                    .attr("class","col-md-8")
                    .append("textarea")
                    .attr("id",id)
                    .attr("name",id)
                    .attr("class","form-control input-md")
    if(placeholder == ""){
        input_element.text(value)
    }
    if(value == ""){
        input_element.attr("placeholder",placeholder)
    }

}

var set_category_select = function(form_group,id,text_label,value,data){
    // add label to dropdown
    form_group.append("label")
    .attr("class","col-md-2 control-label")
    .attr("for",id)
    .text(text_label)
    // add dropdown
    form_group.append("div")
    .attr("class","col-md-8")
    .append("select")
    .attr("id",id)
    .attr("name",id)
    .attr("class","form-control")
    put_options_here = d3.select("#"+id)
    // get length of subcategories
    data_length = data.length

    // put options on dropdown
    for(var j = 0; j < data_length; j++){
        option = put_options_here
        .append("option")
        .attr("value",data[j].id)
        .text(data[j].name)
        if(data[j].name == value){
            option.attr("selected","selected")
        }
    }
}