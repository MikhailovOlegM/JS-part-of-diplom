import {jsPlumb} from "../../index";

;
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
                var s = "<span><strong>Connections</strong></span><br/><br/><table><tr><th>Scope</th><th>Source</th><th>Target</th></tr>";
                for (var j = 0; j < connections.length; j++) {
                    console.log('connectionsArray: ', connections)
                    s = s + "<tr><td>" + connections[j].scope + "</td>" + "<td>"
                        + connections[j].sourceId + "</td><td>"
                        + connections[j].targetId + "</td></tr>";
                }
                showConnectionInfo(s);
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
                    console.log(pos)
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
                    console.log(ui.helper.attr('id'));
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
                            exampleEndpoint2);

                        var elem = jsPlumb.getSelector("." + 'window');
                        console.log('selector: ', elem);

                    }
                }
            });

            ///////////////////////////////////////////////////////
            var elem = jsPlumb.getSelector(".window");
            var idOfClickedElem
            console.log('selector: ', elem);

            $(document).on('dblclick', '.window', function () {
                var className = $(this).attr('class');
                idOfClickedElem = $(this).attr('id');

                var key = className.substring(
                    className.indexOf('dragged'), className.indexOf('dragged')
                    + 8).trim();
                console.log('key:', key);
                switch (key) {
                    case "dragged1":
                        UIkit.offcanvas("#modal-sections1").show();
                        break;
                    // case "dragged2":
                    //     var modal = UIkit.modal("#modal-sections2");
                    //     modal.show();
                    // break;
                    // case "dragged3":
                    //     var modal = UIkit.modal("#modal-sections3");
                    //     modal.show();
                    // break;
                    // case "dragged4":
                    //     var modal = UIkit.modal("#modal-sections4");
                    //     modal.show();
                    // break;
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

            function saveFirstModal(ev) {
                console.log('ev', ev);
            }

            ////ipv 4 and ipv6 ////
            $(function () {
                $('#modal1-ipv4').ipAddress();
                $('#modal1-ipv6').ipAddress({v: 6});
            });

            /////////////////Button save listener////////////////////////
            $('#saveBtn').click(function () {
                console.log('name: ', $('#modal1-name').val());
                console.log('mac: ', $('#modal1-mac-address').val());
                var infoOfObject = {
                    id: 1,
                    name: $('#modal1-name').val(),
                    mac: $('#modal1-mac-address').val(),
                    ipv4: $('#modal1-ipv4').val(),
                    ipv6: $('#modal1-ipv6').val()
                };
                var resultJSON = JSON.stringify(infoOfObject);

                $.ajax({
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    url: 'http://127.0.0.1:8088/test/save',
                    data: resultJSON,
                    dataType: "json"
                });

                console.log('result: ', resultJSON);
            });
            ///////////////////add connection button///////////////////////////
            var inst = $('#type-of-connection').remodal();
            $('#addConnection').click(function () {
                console.log('add connection', idOfClickedElem);


                inst.open();

                $(document).on('closing', '.remodal', function (e) {
                    var typeConnection = $("#selected_type").val();

                    switch (typeConnection) {
                        case "Ethernet":
                            console.log('add ethernet conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors}, EthernetConnetion);
                            break;
                        case "Wi-Fi":
                            console.log('add wifi conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors}, WiFiConnection);
                            break;
                        case "LAN":
                            console.log('add lan conn');
                            instance.addEndpoint(idOfClickedElem, {anchor: anchors}, LANConnection);
                            break;
                    }

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

            // instance.bind("connectionMoved", function (info, originalEvent) {
            //     //  only remove here, because a 'connection' event is also fired.
            //     // in a future release of jsplumb this extra connection event will not
            //     // be fired.
            //     updateConnections(info.connection, true);
            // });

            $(document).ready(function () {
                $('.jtk-connector').click(function () {
                    console.log(this.id);
                });
            });

            instance.bind("dblclick", function (component, originalEvent) {
                jsPlumb.detach($this);
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
                    beforeDrop: function (params) {
                        return confirm("Connect " + params.sourceId + " to " + params.targetId
                            + "?");
                    },
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
                beforeDrop: function (params) {
                    return confirm("Connect " + params.sourceId + " to " + params.targetId
                        + "?");
                },
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
                maxConnections: 2,
                isTarget: true,
                    beforeDrop: function (params) {
                        return confirm("Connect " + params.sourceId + " to " + params.targetId
                            + "?");
                    },
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
                maxConnections: 2,
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
