//////////// objects ////////////
var mapOfDevices = new Map();
var mapOfModalWindow = new Map();


function saveModalWidnow(elementId, modal) {
    if (elementId != null && modal != null) {
        console.log('put modal to map');
        mapOfModalWindow.set(elementId, modal);
    }
}

function WiFi(type, id, name, interfaces, mac, IPv4, IPv6, routuing, acl, dhcp, nat) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.interface = interfaces;
    this.mac = mac;
    this.IPv4 = IPv4;
    this.IPv6 = IPv6;
    this.routing = routuing;
    this.acl = acl;
    this.dhcp = dhcp;
    this.nat = nat;
    this.connectedDevice = [];
}

function Switch(type, id, name, stp) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.stp = stp;
    this.vlan_group = [];
    this.connectedDevice = [];
}

function VlanGroup(type, port) {
    this.type = type;
    this.port = port;
}

function Lan(type, id, name, count) {
    this.type = type;
    this.id = id;
    this.count = count;
    this.name = name;
    this.staticAdresses = [];
    this.connectedDevice = [];
}

function StaticLan(name, ip) {
    this.name = name;
    this.ip = ip;
}

function Router(type, id, name, interfaces, mac, IPv4, IPv6, routuing, acl, dhcp, nat) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.interface = interfaces;
    this.mac = mac;
    this.IPv4 = IPv4;
    this.IPv6 = IPv6;
    this.routing = routuing;
    this.acl = acl;
    this.dhcp = dhcp;
    this.nat = nat;
    this.vrrp = [];
    this.connectedDevice = [];
}

function VRRP(type, addresses) {
    this.type = type;
    this.addresses = addresses;
}

function Server(type, id, name, interfaces, mac, IPv4, IPv6, service, os) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.interface = interfaces;
    this.mac = mac;
    this.IPv4 = IPv4;
    this.IPv6 = IPv6;
    this.service = service;
    this.os = os;
    this.connectedDevice = [];
}

function getDeviceById(id) {
    return mapOfDevices.get(id);
}

function updateDevConnection(sourseId, targetId) {
    var sourceDev = mapOfDevices.get(sourseId);
    if (!sourceDev.connectedDevice.includes(targetId)) {
        sourceDev.connectedDevice.push(targetId);
    }
    console.log('update connected devices');
    console.log('update source: ' + sourseId);
    console.log('update target: ' + targetId);
}

function addNewDeviceToArray(element) {
    console.log('put device to map ');
    mapOfDevices.set(element.id, element);
}

function getAllDevice() {
    var deviceArray = [];
    mapOfDevices.forEach(function (item, i, arr) {
        deviceArray.push(item)
    });
    return JSON.stringify(deviceArray);
}

$(document).ready(function () {
    $('.js-example-basic-single').select2();
    $('.js-example-basic-multiple').select2({
        tags: true,
        tokenSeparators: [',', ' ']
    });
});

UIkit.util.on(document, 'show', '.uk-tooltip.uk-active', function () {
    $(".drag").mousedown(function () {
        UIkit.tooltip(".uk-tooltip").hide();
    });

});

/////////////////////////////////
(function () {

    var listDiv = document.getElementById("list"),

        showConnectionInfo = function (s) {
            listDiv.innerHTML = s;
            listDiv.style.display = "block";
        },
        hideConnectionInfo = function () {
            listDiv.style.display = "none";
        },
        connections = [],
        updateConnections = function (conn, remove) {
            if (!remove) {
                connections.push(conn);
            } else {
                var idx = -1;
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i] == conn) {
                        idx = i;
                        break;
                    }
                }
                if (idx != -1) {
                    connections.splice(idx, 1);
                }
            }
            console.log("length: ", connections.length);
            if (connections.length > 0) {
                //var s = "<span><strong>Connections</strong></span><br/><br/><table><tr><th>Scope</th><th>Source</th><th>Target</th></tr>";
                for (var j = 0; j < connections.length; j++) {
                    console.log('connectionsArray: ', connections);

                    ////update connection/////
                    updateDevConnection(connections[j].sourceId, connections[j].targetId);

                    //s = s + "<tr><td>" + connections[j].scope + "</td>" + "<td>"
                        //+ connections[j].sourceId + "</td><td>"
                        //+ connections[j].targetId + "</td></tr>";
                }
                //showConnectionInfo(s);
            } else {
                hideConnectionInfo();
            }
        };

    jsPlumb.ready(function () {

        var instance = jsPlumb.getInstance({
            DragOptions: {cursor: 'pointer', zIndex: 2000},
            PaintStyle: {stroke: '#666'},
            EndpointHoverStyle: {fill: "orange"},
            HoverPaintStyle: {stroke: "orange"},
            EndpointStyle: {width: 20, height: 16, stroke: '#666'},
            Endpoint: "Rectangle",
            Anchors: ["TopCenter", "TopCenter"],
            Container: "canvas"
        });

        // suspend drawing and initialise.
        instance.batch(function () {

            /////////my part////////////////
            //Counter
            counter = 0;
            //Make element draggable
            $(".drag").draggable({
                helper: 'clone',
                containment: 'frame',

                //When first dragged
                stop: function (ev, ui) {
                    var pos = $(ui.helper).offset();
                    console.log(pos);
                    objName = "#clonediv" + counter;
                    console.log(jsPlumb.getSelector(objName));

                    var X = ev.pageX; // положения по оси X
                    var Y = ev.pageY; // положения по оси Y
                    console.log("X: " + X + " Y: " + Y);

                    $(objName).css({"left": 100, "top": 100});
                    $(objName).removeClass("drag");

                    //When an existiung object is dragged
                    $(objName).draggable({
                        containment: 'parent',
                        stop: function (ev, ui) {
                            var pos = $(ui.helper).offset();
                            console.log($(this).attr("id"));
                            console.log(pos.left);
                            console.log(pos.top);
                        }
                    });
                }

            });
            var element;
            $("#canvas").droppable({
                drop: function (ev, ui) {
                    if (ui.helper.attr('id').search(/drag[0-9]/) != -1) {
                        counter++;
                        element = $(ui.draggable).clone();
                        console.log("element: ", element);
                        element.addClass("tempclass");
                        //$( "#canvas" ).append( "<div class=\"window\" id=\"dragDropWindow6\">six<br/></div>" );
                        $("#canvas").append(element);
                        var newElementId = "clonediv" + counter;
                        $(".tempclass").attr("id", newElementId);
                        $("#clonediv" + counter).removeClass("tempclass");

                        //Get the dynamically item id
                        draggedNumber = ui.helper.attr('id').search(/drag([0-9])/)
                        //itemDragged = "dragDropWindow1 window"
                        itemDragged = " window dragged" + RegExp.$1
                            + " jtk-draggable jtk-endpoint-anchor";

                        console.log(itemDragged);

                        $("#clonediv" + counter).addClass(itemDragged);

                        console.log("find end point", newElementId);
                        instance.draggable(jsPlumb.getSelector("#" + newElementId));
                        instance.addEndpoint(newElementId, {anchor: [0.5, 1, 0, 1]},
                            LANConnection);

                        var elem = jsPlumb.getSelector("." + 'window');
                        console.log('selector: ', elem);

                    }
                }
            });

            /////////////////////// ////////////////////////////////
            var elem = jsPlumb.getSelector(".window");
            var idOfClickedElem;

            $(document).on('dblclick', '.window', function () {
                var className = $(this).attr('class');
                idOfClickedElem = $(this).attr('id');

                console.log('dblclick to element: ' + idOfClickedElem);
                console.log('map: ', mapOfModalWindow);
                if (mapOfModalWindow.has(idOfClickedElem)) {
                    console.log('contains');
                    var modalWindow = mapOfModalWindow.get(idOfClickedElem);
                    var currentElement = getDeviceById(idOfClickedElem);
                    console.log('currentElement: ', currentElement)
                    modalWindow.find("span").remove();
                    modalWindow.find("select").select2();
                    switch (currentElement.type) {
                        case "wifi":
                            console.log('type = wifi')
                            $(modalWindow).find('#wifi_interface').val(currentElement.interface).trigger('change');
                            $(modalWindow).find('#wifi_routing').val(currentElement.routing).trigger('change');
                            $(modalWindow).find('#wifi_acl').val(currentElement.acl).trigger('change');
                            $(modalWindow).find('#wifi_nat').val(currentElement.nat).trigger('change');
                            break;
                        case "switch":
                            console.log('case switch ')
                            $(modalWindow).find('#switch_stp').val(currentElement.stp).trigger('change');

                            break;
                        case "router":
                            console.log('case router ')
                            $(modalWindow).find('#router_interface').val(currentElement.interface).trigger('change');
                            $(modalWindow).find('#router_routing').val(currentElement.routing).trigger('change');
                            $(modalWindow).find('#router_acl').val(currentElement.acl).trigger('change');
                            $(modalWindow).find('#router_nat').val(currentElement.nat).trigger('change');
                            console.log('vrrp: ', currentElement.vrrp[0].type);
                            console.log('vrrp: ', currentElement.vrrp[0].addresses);
                            $(modalWindow).find('#router_redundancy_role').val(currentElement.vrrp[0].type).trigger('change');
                            $(modalWindow).find('#router_redundancy_other').val(currentElement.vrrp[0].addresses).trigger('change');
                            break;
                        case "lan":
                            break;
                        case "server":
                            break;
                    }

                    UIkit.offcanvas($(modalWindow)).show();
                } else {
                    var key = className.substring(
                        className.indexOf('dragged'), className.indexOf('dragged')
                        + 8).trim();
                    console.log('key:', key);
                    switch (key) {
                        case "dragged1":
                            UIkit.offcanvas("#wifi_router").show();
                            break;
                        case "dragged3":
                            var modal = UIkit.offcanvas("#switch");
                            modal.show();
                            break;
                        case "dragged2":
                            var modal = UIkit.offcanvas("#lan_device");
                            modal.show();
                            break;
                        case "dragged5":
                            var modal = UIkit.offcanvas("#server");
                            modal.show();
                            break;
                        case "dragged6":
                            console.log('show modal');
                            var modal = UIkit.offcanvas("#router");
                            modal.show();
                            break;
                    }

                }
            });

            /////////////////////input field on modal///////////////////////
            $('.mac-address').mask('AA:AA:AA:AA:AA:AA', {
                onKeyPress: function (str, e, obj) {
                    $(obj).val(str.toLowerCase());
                }
            });
            // show max speed in canvas//
            $('.max_speed_value').text('15');
            $(document).on('input', '.uk-range', function () {
                $('.max_speed_value').html($(this).val());
            });

            ////ipv 4 and ipv6 ////
            $(function () {
                $('.ip_address_v4').ipAddress();
                $('.ip_address_v6').ipAddress({v: 6});
            });

            /////////////////Button save listener////////////////////////
            $("#saveResultBtn").live('click', function () {
                console.log('element: ', mapOfDevices);
                console.log('element: ', getAllDevice());
                var resultJSON = getAllDevice();

                var response = new XMLHttpRequest();
                response.open('POST', 'http://127.0.0.1:8088/generate/save', false);
                response.send(resultJSON);

                if ($(document).ajaxSuccess()) {
                    var file = new Blob([response.responseText], {type: 'text/xml'});
                    if (window.navigator.msSaveOrOpenBlob) // IE10+
                        window.navigator.msSaveOrOpenBlob(file, 'structure.json');
                    else { // Others
                        var a = document.createElement("a"),
                            url = URL.createObjectURL(file);
                        a.href = url;
                        a.download = 'structure.json';
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function () {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }, 0);
                    }
                }
            });
            /////////////////Button delete listener////////////////////////

            var elem = jsPlumb.getSelector(".window");
            var idOfClicked;
            $(document).on('dblclick', '.window', function () {
                idOfClicked = '#' + $(this).attr('id');
            });

            $(".deleteBtn").live('click', function () {
                console.log('remove elem: ' + idOfClicked);
                console.log('remove elem: ', $('#switch_form')[0]);
                instance.remove($(idOfClicked));
                $('#switch_form').get(0).reset();
            });

            /////////////////////////save modal after hide ////////////////////

            $('.modal_hide').on({
                'hide.uk.modal': function () {
                    console.log('save after hide:');
                    var thisModal = $(this).clone();
                    var oldId = thisModal.attr('id');
                    var newPrefixToId = idOfClicked.substring(1, idOfClicked.length);
                    var newId = oldId + '_' + newPrefixToId;
                    console.log(newId);
                    thisModal.attr('id', newId);
                    $('body').append(thisModal);

                    saveModalWidnow(newPrefixToId, thisModal);

                    var name = thisModal.text().trim();
                    var key = name.substring(0, name.indexOf(' '));
                    console.log('key: ' + key);

                    var newObject;
                    switch (key.trim()) {
                        case "Wi-Fi":
                            console.log('save wifi');
                            newObject = new WiFi('wifi', newPrefixToId,
                                $('#wifi_name').val(),
                                $('#wifi_interface').val(),
                                $('#wifi_mac').val(),
                                $('#wifi_ipv4').val(),
                                $('#wifi_ipv6').val(),
                                $('#wifi_routing').val(),
                                $('#wifi_acl').val(),
                                $('#wifi_dhcp').val(),
                                $('#wifi_nat').val()
                            );
                            break;
                        case "Switch":
                            console.log('save Switch');
                            newObject = new Switch('switch', newPrefixToId,
                                $('#switch_name').val(),
                                $('#switch_stp').val()
                            );

                            var arrayOfVlanGroup = document.getElementById(thisModal.attr('id')).getElementsByClassName('vlan-group');
                            for (var i = 1; i < arrayOfVlanGroup.length; i++) {
                                var type = $('#switch_vlan_' + i).val();
                                var port = $('#switch_vlanport_' + i).val();
                                if (type == null || port == null) {
                                    continue;
                                }
                                console.log(type);
                                console.log(port);
                                var VLAN = new VlanGroup(type, port);
                                newObject.vlan_group.push(VLAN);
                            }
                            break;
                        case "Router":
                            console.log('save router');
                            newObject = new Router('router', newPrefixToId,
                                $('#router_name').val(),
                                $('#router_interface').val(),
                                $('#router_mac').val(),
                                $('#router_ipv4').val(),
                                $('#router_ipv6').val(),
                                $('#router_routing').val(),
                                $('#router_acl').val(),
                                $('#router_dhcp').val(),
                                $('#router_nat').val()
                            );
                            var vrrpObj = new VRRP(
                                $('#router_redundancy_role').val(),
                                $('#router_redundancy_other').val()
                            );
                            newObject.vrrp.push(vrrpObj);
                            break;
                        case "LAN":
                            console.log('save lan');
                            newObject = new Lan('lan', newPrefixToId,
                                $('#lan_name').val(),
                                $('#lan_count').val()
                            );
                            var arrayOfVStaticGroup = document.getElementById(thisModal.attr('id')).getElementsByClassName('static-group');
                            for (var i = 1; i < arrayOfVStaticGroup.length; i++) {
                                var name = $('#lan_static_name_' + i).val();
                                var ip = $('#lan_static_ip_' + i).val();
                                if (name == null || ip == null) {
                                    continue;
                                }
                                console.log(name);
                                console.log(ip);
                                var staticGroup = new StaticLan(name, ip);
                                newObject.staticAdresses.push(staticGroup);
                            }
                            break;
                        case "Server":
                            console.log('save server');
                            newObject = new Server('server', newPrefixToId,
                                $('#server_name').val(),
                                $('#server_interface').val(),
                                $('#server_mac').val(),
                                $('#server_ipv4').val(),
                                $('#server_ipv6').val(),
                                $('#server_service').val(),
                                $('#server_os').val()
                            );
                            break;
                    }
                    addNewDeviceToArray(newObject);

                }
            });


            /////////////////////////multiselect //////////////////////////////
            $(".hide_wifi_nat").hide();
            $(".hide_router_nat").hide();
            $(".hide_router_redundancy").hide();

            $("#wifi_nat_check").live('click', function (e) {
                console.log('hide wifi nat');
                $(".hide_wifi_nat").toggle();
                $("#wifi_nat").prop('disabled', false);

            });

            $("#router_nat_check").live('click', function (e) {
                console.log('hide router nat');
                $(".hide_router_nat").toggle();
                $("#router_nat").prop('disabled', false);

            });

            $("#router_redundancy_check").live('click', function (e) {
                console.log('hide_router_redundancy');
                $(".hide_router_redundancy").toggle();
                $("#router_redundancy_role").prop('disabled', false);
                $("#router_redundancy_other").prop('disabled', false);

            });


            /////////////////////add vlan btn//////////////////////////////////
            var counterOfCopyBlock = 1;
            $('#add_vlan_btn').live('click', function () {
                counterOfCopyBlock++;
                var str = "<div id=\"vlan_goup" + counterOfCopyBlock + "\" class=\"background_groups uk-border-rounded\">\n" +
                    "                            <select id=\"switch_vlan_" + counterOfCopyBlock + "\" class=\" vlan-group js-example-basic-single\" name=\"Routing\"\n" +
                    "                                    style=\"width: 200px;margin-top: 15px !important; color: #000;\">\n" +
                    "                                <option value=\"Select type\"></option>\n" +
                    "                                <option value=\"RSTP\">RSTP</option>\n" +
                    "                                <option value=\"SPB\">SPB</option>\n" +
                    "                            </select>\n" +
                    "                            <input id=\"switch_vlanport_" + counterOfCopyBlock + "\" class=\" vlan-group uk-input uk-form-width-medium uk-form-small\"\n" +
                    "                                         type=\"text\" placeholder=\"Port\">\n" +
                    "                        </div>";


                $('#all_vlan > div').append(str);

                $('#switch_vlan_' + counterOfCopyBlock).select2();
                // $('.vlan_goup_clone').html('');
            });

            $('#add_static_btn').live('click', function () {
                counterOfCopyBlock++;
                var str = "<div id=\"static_goup" + counterOfCopyBlock + "\" class=\"background_groups uk-border-rounded\">\n" +
                    "                            <input id=\"lan_static_name_" + counterOfCopyBlock + "\" + style=\"margin-top: 10px;\"\n" +
                    "                                   class=\"uk-input uk-form-width-medium uk-form-small static-group\"\n" +
                    "                                   type=\"text\" placeholder=\"Name\"></br>\n" +
                    "                            <input id=\"lan_static_ip_" + counterOfCopyBlock + "\"\n" +
                    "                                   class=\"uk-input uk-form-width-medium uk-form-small ip_address_v4 static-group\"\n" +
                    "                                   type=\"text\" placeholder=\"Ip\">\n" +
                    "                        </div>";


                $('#all_static > div').append(str);
                $('.ip_address_v4').ipAddress();
            });
            ///////////////////add connection button///////////////////////////
            var inst = $('#type-of-connection').remodal();
            $('.addConnection').live('click', function () {
                console.log('add connection', idOfClickedElem);

                inst.open();

                $(document).on('closing', '.remodal', function (e) {
                    var typeConnection = $("#selected_type").val();

                    switch (typeConnection) {
                        case "Ethernet":
                            console.log('add ethernet conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors},
                                EthernetConnetion);
                            break;
                        case "Wi-Fi":
                            console.log('add wifi conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors},
                                WiFiConnection);
                            break;
                        case "LAN":
                            console.log('add lan conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors},
                                LANConnection);
                            break;
                    }

                    $("#selected_type").val('')
                    inst.close();

                });

            });

            // bind to connection/connectionDetached events, and update the list of connections on screen.
            instance.bind("connection", function (info, originalEvent) {
                updateConnections(info.connection);
            });
            instance.bind("connectionDetached", function (info, originalEvent) {
                updateConnections(info.connection, true);
            });

            $(document).ready(function () {
                $('.jtk-connector').click(function () {
                    console.log(this.id);
                });
            });

            instance.bind("dblclick", function (component, originalEvent) {
                jsPlumb.deleteConnection(component);
            });

            // configure some drop options for use by all endpoints.
            var exampleDropOptions = {
                tolerance: "touch",
                hoverClass: "dropHover",
                activeClass: "dragActive"
            };

            //
            // first example endpoint.  it's a 25x21 rectangle (the size is provided in the 'style' arg to the Endpoint),
            // and it's both a source and target.  the 'scope' of this Endpoint is 'exampleConnection', meaning any connection
            // starting from this Endpoint is of type 'exampleConnection' and can only be dropped on an Endpoint target
            // that declares 'exampleEndpoint' as its drop scope, and also that
            // only 'exampleConnection' types can be dropped here.
            //
            // the connection style for this endpoint is a Bezier curve (we didn't provide one, so we use the default), with a strokeWidth of
            // 5 pixels, and a gradient.
            //
            // there is a 'beforeDrop' interceptor on this endpoint which is used to allow the user to decide whether
            // or not to allow a particular connection to be established.
            //
            var detachLinks = jsPlumb.getSelector(".drag-drop-demo .detach");
            instance.on(detachLinks, "click", function (e) {
                console.log("detachLinks", detachLinks);
                instance.detachAllConnections(this.getAttribute("rel"));
                jsPlumbUtil.consume(e);
            });

            var EthernetColor = "#00f";
            var EthernetConnetion = {
                endpoint: "Rectangle",
                paintStyle: {fill: EthernetColor},
                isSource: true,
                scope: "Ethernet",
                connectorStyle: {stroke: EthernetColor, strokeWidth: 6},
                connector: ["Bezier", {curviness: 63}],
                maxConnections: 2,
                isTarget: true,
                // beforeDrop: function (params) {
                //     return confirm("Connect " + params.sourceId + " to " + params.targetId
                //         + "?");
                // },
                dropOptions: exampleDropOptions
            };

            var WifiColor = "#ff9900";
            var WiFiConnection = {
                endpoint: ["Dot", {radius: 7}],
                paintStyle: {width: 25, height: 21, fill: WifiColor},
                isSource: true,
                reattach: true,
                scope: "WiFi",
                connectorStyle: {
                    gradient: {
                        stops: [
                            [0, WifiColor],
                            [0.5, "#e28900"],
                            [1, WifiColor]
                        ]
                    },
                    strokeWidth: 5,
                    stroke: WifiColor,
                    dashstyle: "2 2"
                },
                isTarget: true,

                dropOptions: exampleDropOptions
            };

            var LanColor = "#00d300";
            var LANConnection = {
                endpoint: "Rectangle",
                paintStyle: {fill: LanColor},
                isSource: true,
                scope: "LAN",
                connectorStyle: {stroke: LanColor, strokeWidth: 6},
                connector: ["Bezier", {curviness: 63}],
                maxConnections: 10,
                // beforeDetach: function (conn) {
                //     return confirm("Detach connection?");
                // },
                isTarget: true,

                dropOptions: exampleDropOptions
            };

            // the second example uses a Dot of radius 15 as the endpoint marker, is both a source and target,
            // and has scope 'exampleConnection2'.

            var color2 = "#316b31";
            var exampleEndpoint2 = {
                endpoint: ["Dot", {radius: 11}],
                paintStyle: {fill: color2},
                isSource: true,
                scope: "green",
                connectorStyle: {stroke: color2, strokeWidth: 6},
                connector: ["Bezier", {curviness: 63}],
                maxConnections: 10,
                isTarget: true,
                dropOptions: exampleDropOptions
            };

            //
            // the third example uses a Dot of radius 17 as the endpoint marker, is both a source and target, and has scope
            // 'exampleConnection3'.  it uses a Straight connector, and the Anchor is created here (bottom left corner) and never
            // overriden, so it appears in the same place on every element.
            //
            // this example also demonstrates the beforeDetach interceptor, which allows you to intercept
            // a connection detach and decide whether or not you wish to allow it to proceed.
            //
            var example3Color = "rgba(229,219,61,0.5)";
            var exampleEndpoint3 = {
                endpoint: ["Dot", {radius: 17}],
                anchor: "BottomLeft",
                paintStyle: {fill: example3Color, opacity: 0.5},
                isSource: true,
                scope: 'yellow',
                connectorStyle: {
                    stroke: example3Color,
                    strokeWidth: 4
                },
                connector: "Straight",
                isTarget: true,
                dropOptions: exampleDropOptions,
                beforeDetach: function (conn) {
                    return confirm("Detach connection?");
                },
                onMaxConnections: function (info) {
                    alert("Cannot drop connection " + info.connection.id
                        + " : maxConnections has been reached on Endpoint "
                        + info.endpoint.id);
                }
            };

            // setup some empty endpoints.  again note the use of the three-arg method to reuse all the parameters except the location
            // of the anchor (purely because we want to move the anchor around here; you could set it one time and forget about it though.)

            // setup some DynamicAnchors for use with the blue endpoints
            // and a function to set as the maxConnections callback.
            var anchors = [
                    [1, 0.2, 1, 0],
                    [0.8, 1, 0, 1],
                    [0, 0.8, -1, 0],
                    [0.2, 0, 0, -1]
                ],
                maxConnectionsCallback = function (info) {
                    alert("Cannot drop connection " + info.connection.id
                        + " : maxConnections has been reached on Endpoint "
                        + info.endpoint.id);
                };
            /*
               var e1 = instance.addEndpoint("dragDropWindow1", { anchor: anchors }, exampleEndpoint);
               // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
               e1.bind("maxConnections", maxConnectionsCallback);

               var e2 = instance.addEndpoint('dragDropWindow2', { anchor: [0.5, 1, 0, 1] }, exampleEndpoint);
               // again we bind manually. it's starting to get tedious.  but now that i've done one of the blue endpoints this way, i have to do them all...
               e2.bind("maxConnections", maxConnectionsCallback);
               instance.addEndpoint('dragDropWindow2', { anchor: "RightMiddle" }, exampleEndpoint2);

               var e3 = instance.addEndpoint("dragDropWindow3", { anchor: [0.25, 0, 0, -1] }, exampleEndpoint);
               e3.bind("maxConnections", maxConnectionsCallback);
               instance.addEndpoint("dragDropWindow3", { anchor: [0.75, 0, 0, -1] }, exampleEndpoint2);

               var e4 = instance.addEndpoint("dragDropWindow4", { anchor: [1, 0.5, 1, 0] }, exampleEndpoint);
               e4.bind("maxConnections", maxConnectionsCallback);
               instance.addEndpoint("dragDropWindow4", { anchor: [0.25, 0, 0, -1] }, exampleEndpoint2);
      */
            // make .window divs draggable
            instance.draggable(jsPlumb.getSelector(".drag-drop-demo .window"));

            // add endpoint of type 3 using a selector.
            instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"),
                exampleEndpoint3);

            var hideLinks = jsPlumb.getSelector(".drag-drop-demo .hide");
            instance.on(hideLinks, "click", function (e) {
                instance.toggleVisible(this.getAttribute("rel"));
                jsPlumbUtil.consume(e);
            });

            var dragLinks = jsPlumb.getSelector(".drag-drop-demo .drag");
            instance.on(dragLinks, "click", function (e) {
                console.log("dragLinks", dragLinks);
                var s = instance.toggleDraggable(this.getAttribute("rel"));
                this.innerHTML = (s ? 'disable dragging' : 'enable dragging');
                jsPlumbUtil.consume(e);
            });

            var detachLinks = jsPlumb.getSelector(".drag-drop-demo .detach");
            instance.on(detachLinks, "click", function (e) {
                console.log("detachLinks", detachLinks);
                instance.detachAllConnections(this.getAttribute("rel"));
                jsPlumbUtil.consume(e);
            });

            instance.on(document.getElementById("clear"), "click", function (e) {
                instance.detachEveryConnection();
                showConnectionInfo("");
                jsPlumbUtil.consume(e);
            });
        });

        jsPlumb.fire("jsPlumbDemoLoaded", instance);

    });
})();
