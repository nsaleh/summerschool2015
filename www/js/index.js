/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        this.map=null;
        this.positionmarker=null;
        var that=this;
        $(document).on('pageinit', '#mappage', function(){
            that.map = L.map('map');

            L.tileLayer.wms('http://map.iib-institut.de/mapproxy/service?', {
                layers: 'iibmap',
                format: 'image/png',
                maxZoom: 16
            }).addTo(that.map);
            that.map.setView([49.469930,8.481660],13);
            that.initMarkerLayer();
        });
        $(document).on('tap','#locatebtn',function(e){
            that.locate();
        });
        $(document).on('pageshow', '#mappage', function(){

            that.map.invalidateSize();
            window.setTimeout(function(){that.map.invalidateSize()},2000);
            //that.locate();
        });
        $(document).on('tap','#takepicture',function(e){
            that.takepicture();
        });
        $(document).on('tap','#sharenow',function(e){
            if(that.positionmarker === null){
                alert("Zuerst Positionieren");
                return;
            }
            var ambidata = $('#shareform').serialize()+'&ambiweather[position]='+that.positionmarker.getLatLng().lat+','+that.positionmarker.getLatLng().lng;
            $.ajax({
                url: 'http://www.wohnlagenkarte.de/AMBIWEATHER/CREATE',
                type: 'POST',
                dataType: "json",
                data: ambidata,
                success: function(answer){
                    console.log(answer);
                    that.updatemarkerLayer();
                    $.mobile.changePage('#mappage');
                },
                error: function(response){
                    console.log(response);
                }

            });
        });


    },
    locate:function(){
        var that=this;
        var onSuccess = function(position) {
            if(that.positionmarker === null){
                that.positionmarker = new L.marker([position.coords.latitude,position.coords.longitude],{draggable:true});
                that.positionmarker.addTo(that.map);
            }else{
                that.positionmarker.setLatLng([position.coords.latitude,position.coords.longitude]);
            }
            that.map.setView([position.coords.latitude,position.coords.longitude],15);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
    takepicture: function(){
        //capture element nur sichtbar wenn alle pages versteckt
        $('#mappage').removeClass('ui-page-active');
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL,
            targetHeight: 500,
            targetWidth: 500
        });

        function onSuccess(imageData) {
            var image = document.getElementById('userpic');
            image.src = "data:image/jpeg;base64," + imageData;
            //page wiederherstellen
            $('#mappage').addClass('ui-page-active');
            $.mobile.changePage('#bildpage');
        }

        function onFail(message) {
            //page wiederherstellen
            $('#mappage').addClass('ui-page-active');
            alert('Failed because: ' + message);
        }
    },
    initMarkerLayer: function(){
        var that = this;
        this.markerLayer = L.geoJson(
            null,{

                pointToLayer: function (feature, latlng) {
                    var marker= L.marker(latlng);
                    marker.bindPopup("<b>"+feature.properties.mood+" - "+feature.properties.weather+"</b>");
                    return marker;
                }

            }).addTo(that.map);
        this.markerLayer.bringToFront();
        this.updatemarkerLayer=function(){
            $.ajax({
                type: 'GET',
                url: 'http://www.wohnlagenkarte.de/AMBIWEATHER/LIST?bbox='+ that.map.getBounds().toBBoxString(),
                async: false,
                contentType: "application/json",
                dataType: 'json',
                success: function(data){
                    that.markerLayer.clearLayers();
                    that.markerLayer.addData(data.marker);

                }
            });
        };
        this.updatemarkerLayer();
        this.map.on('viewreset moveend',this.updatemarkerLayer);

    }
    
};

app.initialize();
