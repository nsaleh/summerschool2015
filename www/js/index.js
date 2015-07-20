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
        });
        $(document).on('click','#locatebtn',function(e){
            that.locate();
        });
        $(document).on('pageshow', '#mappage', function(){

            that.map.invalidateSize();
            window.setTimeout(function(){that.map.invalidateSize()},2000);
            //that.locate();
        });

    },
    locate:function(){
        var that=this;
        var onSuccess = function(position) {
            if(that.positionmarker === null){
                that.positionmarker = new L.marker([position.coords.latitude,position.coords.longitude]);
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
    }
    
};

app.initialize();
