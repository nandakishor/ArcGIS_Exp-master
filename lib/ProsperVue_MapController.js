/*
      V2.0.CF-I44       Valgen,Inc(NIKOLAY)      18-10-2018      fixed scalebar style
      V2.0.CF-T235      Valgen,Inc(ANDREY)       19-10-2018      added toolbar logic
      V2.0.CF-T244      Valgen,Inc(ANDREY)       22-10-2018      Added related records functionality
      V2.0.CF-I26       Valgen,Inc(NIKOLAY)      29-10-2018      related object filter logic
      V2.0.CF-I16       Valgen,Inc(NIKOLAY)      08-11-2018      fixed scalebar metric logic
      V2.0.CF-I77       Valgen,Inc(ANDREY)       13-11-2018      fixed object selection logic
      V2.0.CF-I86       Valgen,Inc(ANDREY)       08-11-2018      fixed add to campaign
      V2.0.CF-I22       Valgen,Inc(ANDREY)       08-11-2018      fixed popup position
      V2.0.CF-I92       Valgen,Inc(ANDREY)       08-11-2018      fixed bottom panel
      V2.0.CF-105       Valgen,Inc(ANDREY)       08-11-2018      fixed add to campaign
      V2.0.CF-104       Valgen,Inc(ANDREY)       12-11-2018      fixed add to campaign
      V2.0.CF-106       Valgen,Inc(ANDREY)       13-11-2018      fixed plotting markers on map
      V2.0.CF-I81       Valgen,Inc(KISHOR)       20-11-2018      fixed disengaging Geofencing function
      V2.0.CF-T236      Valgen,Inc(KISHOR)       26-11-2018      Implement Zoom features and Zoom Symbol
      V2.0.CF-T222      Valgen,Inc(KISHOR)       20-11-2018      Implement Geofencing
      V2.0.CF-I24       Valgen,Inc(ANDREY)       20-11-2018      fixed highlighting row
      V2.0.CF-I118      Valgen,Inc(ANDREY)       21-11-2018      fixed add to campaign table
      V2.0.CF-I122      Valgen,Inc(ANDREY)       22-11-2018      fixed related records functionality
      V2.0.CF-I126      Valgen,Inc(ANDREY)       22-11-2018      fixed duplication pins
      V2.0.CF-I36       Valgen,Inc(ANDREY)       23-11-2018      fixed auto-zoom
      V2.0.CF-I154      Valgen,Inc(ANDREY)       08-12-2018      fixed campaign types
      V2.0.CF-I144      Valgen,Inc(ANDREY)       10-12-2018      fixed toggle checkboxes functionality
      V2.0.CF-I144      Valgen,Inc(ANDREY)       12-12-2018      fixed bottom panel
      V2.0.CF-I141      Valgen,Inc(NIKOLAY)      12-12-2018      fixed masking for numbers and booleans
      V2.0.CF-I32       Valgen,Inc(NIKOLAY)      16-12-2018      added summary data to bottom table
      V2.0.CF-I148      Valgen,Inc(Vladislav)    18-12-2018      implemented angular functionality for Change Lead Owner modal
      V2.0.CF-I94       Valgen,Inc(Vladislav)    19-12-2018      fixed bottom panel heading
      V2.0.CF-I74       Valgen,Inc(NIKOLAY)      31-12-2018      fixed default objects should be unchecked bug
      V2.0.CF-I94       Valgen,Inc(ANDREY)       03-01-2019      HARDCODE FIX
      V3.0.CF-I94       Valgen,Inc(IGOR)         10-01-2019      fixed header alignment
      V3.0.CF-I196      Valgen,Inc(NIKOLAY)      08-02-2019      fixed undefined record issue
      V3.0.CF-I94       Valgen,Inc(IGOR)         11-02-2019      fixed header alignment when the left block is open; moved scroll to the right
      V3.0.CF-I94       Valgen,Inc(IGOR)         26-02-2019      fixed header alignment
      V3.0.CF-I225      Valgen,Inc(KISHOR)       15-03-2019      fixed the ZoomLevel issue
      V3.0              Valgen,Inc(NIKOLAY)      02-04-2019      fixed icon url generatio for weather details request
      V3.0              Valgen,Inc(NIKOLAY)      02-04-2019      added support of lazy loading for Markers Data
      V3.0.PS1-T121		Valgen,Inc(KISHOR)		 08-01-2019		 Fixed ZoomLevel issue 
      V3.0.PS1-T130		Valgen,Inc(KISHOR)		 05-11-2019		 Button to Activate/Deactivate Group value color code boundary
      V3.0.PS1-T72		Valgen,Inc(KISHOR)		 05-11-2019		 Group values and color code boundary
      V3.0.PS1-T123		Valgen,Inc(KISHOR)		 05-11-2019		 Dynamically change the Field for the renderer
      V3.0.CF-T237		Valgen,Inc(KISHOR)		 06-28-2019		 Cluster Point Data
*/

var pluginFunctions = [];

prosperVueMapApp.controller("ProsperVue_MapController", function ($scope, $filter,
    $window, $timeout, $compile,
    DataFactory,
    LoadingProcessService, LocationFactory,
    MessageService, $q,
    MapMarkerService, MapService, MapActionService,
    MapDashboardService, MapTopTenFeatureService, PluginsService
) {
    //angular.bind(self, mapController.someFunction);

    window.g_esri = {
        map: null,
        search: null,
        scalebar: null
    };

    $scope.primaryLocationLayerId = 'primary-location';

    $scope.isShowBorderTable = false;

    //V2.0.CF-I148 Start
    $scope.selectOptions = [{
        name: 'User',
        value: 'user'
    }, {
        name: 'Queue',
        value: 'queue'
    }];
    $scope.selectedOption = $scope.selectOptions[0];
    $scope.userSearchkey = '';

    $scope.leadIdsUnderTheShape = [];
    //V2.0.CF-I148 End

    var G_LOADING_PROCESS_SELECTOR = LoadingProcessService.getSelector();
    var G_MARKER_PATH = DataFactory.getMarkerPath();
    var GrGeofencingLayer;
    var editingEnabled = false;

    $scope.initialMapConfig = {
        sObjectsMetadata: []
    };
    // V2.0.CF-I44 start
    var currentdate = new Date();
    $scope.valgenCopyright = 'Valgen Inc. (c) ' + currentdate.getFullYear() + ' powered by ESRI';
    // V2.0.CF-I44 end
    // V2.0.CF-I144 start
    $scope.mainAddLeadToCmpCheckbox = true;
    $scope.mainAddContToCmpCheckbox = true;
    // V2.0.CF-I144 end
    $scope.cmpSearchResults = false;
    $scope.isFlowFinished = false;
    // V2.0.CF-T235 start
    $scope.dislayFigures = false;
    $scope.isToolbarDisplay = false;
    // V2.0.CF-T235 end
    // V2.0.CF-T244 start
    $scope.isRelatedState = false;
    $scope.leftSideBarRowsCopy = {};
    // V2.0.CF-T244 end
    $scope.queriedCampaigns = [];
    $scope.newCampaign = {};
    $scope.searchCampaignModel = {};
    $scope.currentAction = '';
    $scope.isLightning = false;
    $scope.isCreateState = false;
    $scope.iterableRecords = [];
    // V2.0.CF-I86 start
    $scope.selectedLeads = [];
    $scope.selectedContacts = [];
    // V2.0.CF-I86 end
    $scope.cmpFields = ['Select', 'Name', 'Status', 'Start Date', 'End Date', 'Active'];
    $scope.selectedCampaigns = [];
    // V2.0.CF-T244 start
    $scope.relatedRecordsConditions = {};
    $scope.relatedMainRecordId;
    // V2.0.CF-T244 end

    // V2.0.CF-I154 start
    $scope.campaignTypes = [];
    // V2.0.CF-I154 end

    $scope.sObjectDataTables = {};
    $scope.leftSidebar = {};
    $scope.imagePath = DataFactory.getImagePath(ProsperVue_MapResourcesPath);
    $scope.dashboardComponentData = {
        isActive: false
    };
    $scope.publishedSegment = {};
    $scope.showModal = false;
    $scope.showModallead = false;
    $scope.addCampaignsStep = 0;
    $scope.zoomValue;
    $scope.lightenDarkenColor = MapService.LightenDarkenColor

    $scope.pluginsTabs = PluginsService.additionalTabs;
    $scope.pluginLeftSide = PluginsService.currentLeftSideDirective;

    $scope.topTenOccurance = {
        isActive: false
    };
    $scope.colorBoxData = {};

    $scope.getIconAbsolutePath = $window.getIconAbsolutePath;

    $scope.locationMarkerSettings = {
        active: {
            width: 32,
            height: 42
        },
        plain: {
            width: 28,
            height: 36
        }
    }
    // V3.0.PS1-T130
    $scope.IsVisible = false;
    $scope.sObjectGroupDataTable = {};
    $scope.sObjectG;
    $scope.sObjectFieldList = [];
    $scope.sObjectField;
    //V3.0.PS1-T130
    initAccesses();

    function getTooltipStatuses() {
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getTooltipStatuses',
            params: []
        };

        fetchDataFromServer(
            options,
            function (result) {
                $scope.tooltipsState = result;
                $scope.showWelcome = $scope.tooltipsState.objectTooltip && $scope.tooltipsState.recordTooltip && $scope.tooltipsState.searchTooltip;
                if ($scope.showWelcome) {

                    function handler(e) {
                        $scope.showWelcome = false;
                        $scope.$apply();

                        $window.removeEventListener('click', handler)
                    }

                    $window.addEventListener('click', handler);
                }
            },
            function (error) {
                console.log(error);
            }
        )
    }

    $scope.validateAndSaveNewCampaign = function () {
        $scope.createdCampaign = null;
        $scope.createdCampaignErr = null;
        console.log($scope.newCampaign.isActive);
        if ($scope.newCampaign.isActive == undefined)
            $scope.newCampaign.isActive = 'false';
        console.log('newCampaign');
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.createCampaignWithParams',
            params: [$scope.newCampaign]
        };
        $("#createCampaign .loading-spinner").show();
        DataFactory.invokeRemoteAction(options).then((res) => {
            $("#createCampaign .loading-spinner").hide();
            $scope.createdCampaign = res;
            $scope.selectedCampaigns.push($scope.createCampaignWrapper(res));
        }, (reason) => {
            $("#createCampaign .loading-spinner").hide();
            $scope.createdCampaignErr = reason;
        });
    }

    $scope.createCampaignWrapper = function (campaign) {
        var res = {};
        res.campaign = campaign;
        res.status = 'Sent';
        res.owerWrite = true;
        return res;
    }


    $scope.hideTooltip = function (tooltipName) {
        $scope.tooltipsState[tooltipName + 'Tooltip'] = false;
        tooltipName = tooltipName.charAt(0).toUpperCase() + tooltipName.slice(1);
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.hide' + tooltipName + 'Tooltipe',
            params: []
        };

        DataFactory.invokeRemoteAction(options).catch(function (error) {
            console.log(error);
        });
    }
    // V2.0.CF-T244 start
    $scope.showFigures = function () {
        $scope.dislayFigures = true;
    }
    $scope.hideFigures = function () {
        $scope.dislayFigures = false;
    }
    // V2.0.CF-T244 end

    // V2.0.CF-T235 start
    $scope.hideToolPanel = function () {
        $scope.isToolbarDisplay = false;
    }
    // V2.0.CF-T235 end

    $scope.getObjectColor = function (objectName) {
        if (!$scope.initialMapConfig.sObjectsMetadata) return;
        var targetObject = $scope.initialMapConfig.sObjectsMetadata.filter(function (sobject) {
            return sobject.name === objectName;
        })[0];
        return targetObject.iconColor;
    }

    $scope.loadEsriDependencies = function (callback) {

        require([
            "esri/map",
            "esri/graphic",
            "esri/dijit/Search",
            "esri/dijit/Scalebar",
            "esri/layers/FeatureLayer",
            "esri/layers/GraphicsLayer",
            "esri/layers/VectorTileLayer",
            "esri/renderers/smartMapping",
            "esri/toolbars/draw",
            "esri/toolbars/edit",
            "esri/toolbars/navigation",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/CartographicLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/TextSymbol",
            "esri/renderers/SimpleRenderer",
            "esri/layers/LabelClass",
            "esri/Color",
            "esri/SpatialReference",
            "esri/geometry/Point",
            "esri/dijit/PopupTemplate",
            "esri/tasks/ClassBreaksDefinition",
            "esri/tasks/AlgorithmicColorRamp",
            "esri/tasks/GenerateRendererParameters",
            "esri/tasks/GenerateRendererTask",
            "dojo/_base/declare",
            "dojo/_base/array",
            "dojo/_base/connect",
            "dojo/dom",
            "dojox/mobile",
            "dojox/mobile/parser",
            "esri/sniff",
            //"dojox/mobile/deviceTheme",
            "dijit/registry",
            "dojo/on",
            "dojox/mobile/ToolBarButton",
            "dojox/mobile/View",
            "dojox/mobile/ContentPane",
            "dojo/domReady!"
        ],

            function (Map, graphic, Search, Scalebar, FeatureLayer, GraphicsLayer, VectorTileLayer, smartMapping,
                Draw, Edit, Navigation,
                MarkerSymbol, LineSymbol, CartographicLineSymbol, FillSymbol, TextSymbol, SimpleRenderer, LabelClass, color,
                SpatialReference, Point, PopupTemplate,
                ClassBreaksDefinition, AlgorithmicColorRamp, GenerateRendererParameters, GenerateRendererTask,
                declare, arrayUtils, connect,
                dom, mobile, parser, has, registry, on) {

                var self = this;

                /* init Ersi map */
                g_esri.map = initEsriMap(Map);

                GrGeofencingLayer = new GraphicsLayer();
                g_esri.map.addLayer(GrGeofencingLayer);

                createVectorTileLayer(VectorTileLayer);

                //start V3.0.CF-T237
                g_esri.map.ClusterLayer = ClusterLayer(g_esri.map, declare, arrayUtils, color, connect, SpatialReference, Point, graphic, MarkerSymbol, TextSymbol, PopupTemplate, GraphicsLayer);
                arrayutils = arrayUtils;
                //end V3.0.CF-T237

                /* init Ersi search */
                g_esri.search = initEsriSearch(g_esri.map, Search);

                /* init Ersi scalebar */
                g_esri.scalebar = initEsriScalebar(g_esri.map, 'english');
                parser.parse();
                mobile.hideAddressBar();

                //V2.0.CF-T222 Start
                g_esri.drawToolbar = initDrawToolbar(g_esri.map, Draw);

                g_esri.editToolbar = initEditToolbar(g_esri.map, Edit);

                /*GrGeofencingLayer.on("click", function(evt) {
                    //if (evt.ctrlKey) {
                        if (editingEnabled === false && evt.ctrlKey) {
                            editingEnabled = true;
                            g_esri.editToolbar.activate(Edit.EDIT_VERTICES | Edit.MOVE | Edit.ROTATE | Edit.SCALE, evt.graphic);
                        } else {
                            g_esri.editToolbar.deactivate();
                            resetAllMarkers();
                            findPointsInExtent(evt.graphic.geometry);
                            editingEnabled = false;
                        }
                    //}
                });*/
                // V2.0.CF-T222 End

                // V2.0.CF-T236 Start
                g_esri.navToolbar = initNavToolbar(g_esri.map, Navigation);
                var zoomSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_DASH,
                        new esri.Color([0, 0, 0]), 2),
                    new esri.Color([0, 0, 0, 0.25]));

                g_esri.navToolbar.on("extent-history-change", extentHistoryChangeHandler);
                g_esri.navToolbar.setZoomSymbol(zoomSymbol);
                // V2.0.CF-T236 End

                g_esri.map.on("click", function (evt) {
                    g_esri.drawToolbar.deactivate();
                    g_esri.editToolbar.deactivate();
                });

                // V2.0.CF-T235 start
                g_esri.map.on("zoom-end", function (evt) {
                    var slider = $('#zoomslider');
                    if (slider && slider[0]) {
                        slider[0].value = evt.level;
                    }
                });
                // V2.0.CF-T235 end


                /* onorientationchange doesn't always fire in a timely manner in Android so check for both orientationchange and resize */
                var resizeEvt = (window.onorientationchange !== undefined && !has('android')) ? "orientationchange" : "resize";
                on(window, resizeEvt, resizeMap);

                function resizeMap() {
                    mobile.hideAddressBar();
                    $timeout(function () {
                        adjustMapHeight();
                        g_esri.map.resize();
                        g_esri.map.reposition();
                    }, 0)
                    $timeout(function () {
                        updBottomPanel();
                    }, 100);
                }

                function updBottomPanel() {
                    var isSameTabActive = $('.objectListContainer').hasClass('active');
                    if (isSameTabActive) {
                        showBottomPanel();
                    } else {
                        hideBottomPanel();
                    }
                }

                function adjustMapHeight() {
                    var availHeight = getEsriMapHeight();
                    if (has('iphone') || has('ipod')) {
                        availHeight += iphoneAdjustment();
                    }
                    dom.byId("map").style.height = availHeight + "px";
                    alignSidebar();
                }

                function iphoneAdjustment() {
                    var sz = mobile.getScreenSize();
                    if (sz.h > sz.w) { //portrait
                        //Need to add address bar height back to map because it has not been hidden yet
                        /* 44 = height of bottom safari button bar */
                        return screen.availHeight - window.innerHeight - 44;
                    } else { //landscape
                        //Need to react to full screen / bottom button bar visible toggles
                        var _conn = on(window, 'resize', function () {
                            _conn.remove();
                            resizeMap();
                        });
                        return 0;
                    }
                }
            })
    }

    // V2.0.CF-T235 start
    $scope.setZoom = function () {
        var slider = $('#zoomslider');
        var val = slider[0].value;
        g_esri.map.setZoom(val);
    }
    // V2.0.CF-T235 end

    $scope.clearMapp = function () {
        var url = "/apex/ProsperVue_Map";
        if ((typeof sforce != 'undefined') && (sforce != null)) {
            sforce.one.navigateToURL(url);
        } else {
            window.open(url, "_self")
        }
    }

    $scope.fetchsObjectMarkerData = function (sObjectName, sObjectMetadata, initialLoading) {
        LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.app);
        var deferred = $q.defer();

        var primaryMarkerLocation = LocationFactory.getPrimaryMarkerObjData();

        if (!primaryMarkerLocation.latitude || !primaryMarkerLocation.longitude) {
            MessageService.showMessageOnMap('Please select Primary location', 'error');
            LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
            return;
        }

        // V2.0.CF-I77 start
        var issObjectSelected = !$('#icon-' + sObjectName).hasClass("selected");
        var isSelectedsObjectOnFirstPosition = MapService.issObjectOnFirstPosition(sObjectName, $scope.initialMapConfig.sObjectsMetadata);
        // V2.0.CF-I77 end

        // V2.0.CF-I122 start
        // V2.0.CF-I126 start
        if (!issObjectSelected) { /* If sObject unchecked/deselected by user */
            invokeOnSobjectMarkerDeselect(sObjectName, issObjectSelected, isSelectedsObjectOnFirstPosition, sObjectMetadata);
            LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
        } else {
            if ($scope.initialMapConfig.primaryInfo.sObjectName === sObjectName && !initialLoading) {
                plotPrimaryMarkerAndScalebar($scope.initialMapConfig.primaryInfo.location);
            }

            // V2.0.CF-I77 start
            if (initialLoading) {
                var isMainObjSelected = false;
                var relatedObjects = $scope.getRelatedObjects(sObjectName);
                angular.forEach(relatedObjects, function (value, key) {
                    var sObjectMetadata = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata, value, 'name');
                    // V2.0.CF-T244 start
                    if (value == sObjectName) {
                        // V2.0.CF-I74 start
                        // to enable CF-I74 logic remove this line:
                        $scope.fetchsObjectMarkerDataFromServer(deferred, sObjectMetadata, value, primaryMarkerLocation, false, false);
                        isMainObjSelected = true;
                    } else {
                        $scope.fetchsObjectMarkerDataFromServer(null, sObjectMetadata, value, primaryMarkerLocation, false, false);
                    }
                    // V2.0.CF-T244 end
                });
                // to enable CF-I74 logic revert this condition:
                if (!isMainObjSelected) {
                    // V2.0.CF-I74 end
                    $scope.fetchsObjectMarkerDataFromServer(deferred, sObjectMetadata, sObjectName, primaryMarkerLocation, isSelectedsObjectOnFirstPosition, false);
                }
            } else {
                $scope.fetchsObjectMarkerDataFromServer(deferred, sObjectMetadata, sObjectName, primaryMarkerLocation, isSelectedsObjectOnFirstPosition, false);
            }
            // V2.0.CF-I77 end
        }
        return deferred.promise;
        // V2.0.CF-I126 end
        // V2.0.CF-I122 end
    }

    $scope.fetchsObjectMarkerDataFromServer = function (deferred, sObjectMetadata, sObjectName, primaryMarkerLocation, isSelectedsObjectOnFirstPosition, fromRelated) {
        // V2.0.CF-I122 start
        /* get primary marker ID if exist */
        var primaryItemId = ($scope.initialMapConfig.primaryInfo.recordId != undefined) ? $scope.initialMapConfig.primaryInfo.recordId : null;

        /* CF-I26 start */
        /* set parent info if this sObject is related */
        var parentInfo = null;
        if (!isSelectedsObjectOnFirstPosition) {
            parentInfo = $scope.initialMapConfig.primaryInfo;
        }

        /* run method that returns records based on filters and other incoming params */
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getsObjectRecords',
            params: [
                JSON.stringify(primaryMarkerLocation),
                sObjectName,
                $scope.initialMapConfig.adminSettingRecId,
                primaryItemId,
                JSON.stringify(parentInfo)
            ]
        };
        /* CF-I26 end */

        // V3.0_02-04-2019 START
        var optionsToGetTheObejctData = {
            url: 'ValgencfMAPPdev.PVMapController.getsObjectRecordsData',
            params: [
                JSON.stringify(primaryMarkerLocation),
                sObjectName,
                $scope.initialMapConfig.adminSettingRecId,
                primaryItemId
            ]
        };

        fetchDataFromServer(
            options,
            function (objectConfiguration) {
                var selectedRecorIds = [];
                if (primaryItemId) {
                    selectedRecorIds.push(primaryItemId);
                };
                (objectConfiguration.rows || []).forEach(function (row) {
                    selectedRecorIds.push(row.rec.Id);
                });

                console.groupCollapsed('Worker::Start::' + sObjectName);
                console.log('selected records size: ', selectedRecorIds.length);
                console.log('configuration: ', objectConfiguration);

                DataFactory.MarkerDataService.init(optionsToGetTheObejctData)
                    .requestData(selectedRecorIds)
                    .then(function (results) {
                        objectConfiguration.rows = results.rows;
                        objectDataPostProcessing(objectConfiguration);

                        console.groupEnd('Worker::Start::' + sObjectName);
                        if (deferred) {
                            deferred.resolve(objectConfiguration);
                        }
                    })
                    .catch(function (err) {
                        MessageService.showMessageOnMap(err, 'error');
                        LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                        deferred.reject(err);
                        console.groupEnd('Worker::Start');
                    });
            },
            function (error) {
                MessageService.showMessageOnMap(error, 'error');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                deferred.reject(error);
            }
            // V2.0.CF-I122 end
        );

        function objectDataPostProcessing(result) {
            $scope.relatedRecordsConditions[sObjectName] = (result.relatedRecordConditions != null && result.relatedRecordConditions.length > 0) ? result.relatedRecordConditions[0] : {};
            console.log("result => ", result);

            result.rows = mergeRecordAttributes(result.rows);
            result.rows.sort(function (a, b) {
                return a.distance - b.distance
            });
            //console.log(JSON.stringify(result));

            sObjectMetadata.isObjectSelected = true;
            sObjectMetadata.isRelated = false;
            var sObjectMarkerData = populateAddtionalData(sObjectName, result);
            $scope.sObjectDataTables[sObjectName] = sObjectMarkerData;

            // V2.0.CF-T244 start
            for (var item of $scope.sObjectDataTables[sObjectName].rows) {
                item.latitude = item[sObjectMarkerData.latitudeFieldName];
                item.longitude = item[sObjectMarkerData.longitudeFieldName];
            }
            // V2.0.CF-T244 end

            if (sObjectMarkerData && sObjectMarkerData.rows) {
                angular.forEach(sObjectMarkerData.rows, function (row) {

                    if (row.Id == $scope.initialMapConfig.primaryInfo.recordId && row.isMasked == 'true') {
                        try {
                            // mask location data for the current cursor
                            var ranges = [{ min: -250, max: -200 }, { min: 200, max: 250 }];

                            var rand = [];
                            ranges.forEach(function (e) {
                                rand.push(Math.random() * (e.max - e.min + 1) + e.min)
                            });
                            var dx = rand[Math.floor(Math.random() * rand.length)].toFixed(8);
                            var dy = rand[Math.floor(Math.random() * rand.length)].toFixed(8);

                            var r_earth = 6378000;

                            primaryMarkerLocation.latitude = row[sObjectMarkerData.latitudeFieldName] + (dy / r_earth) * (180 / Math.PI);
                            primaryMarkerLocation.longitude = row[sObjectMarkerData.longitudeFieldName] + (dx / r_earth) * (180 / Math.PI) / Math.cos(primaryMarkerLocation.latitude * Math.PI / 180);
                            primaryMarkerLocation.markerGeometryPoint.x = primaryMarkerLocation.latitude;
                            primaryMarkerLocation.markerGeometryPoint.x = primaryMarkerLocation.longitude;
                        } catch (err) {
                            console.log('offset geocoding error');
                        }
                    }
                });
            }

            // V2.0.CF-I32 start
            updateSummary(sObjectName);
            // V2.0.CF-I32 end

            //console.log(JSON.stringify($scope.sObjectDataTables[sObjectName]));
            plotMarkerOnMap(sObjectName, sObjectMetadata.iconColor, sObjectMarkerData);

            redrawMarker($scope.primaryLocationLayerId);
            // V2.0.CF-I77 start
            $('#icon-' + sObjectName).toggleClass("selected");
            if (fromRelated) {
                $('#icon-' + sObjectName).addClass("selected");
            }
            // V2.0.CF-I77 end

            if (isSelectedsObjectOnFirstPosition) {
                initializeLeftsidebar();
            }
            $timeout(function () {
                $('#detailPageSidebarScrollerId').mCustomScrollbar({
                    theme: "dark",
                    autoHideScrollbar: true,
                    scrollTo: "top"
                });
            }, 50);

            // V2.0.CF-I106 start
            // V3.0.PS1-T121 Start
            $timeout(function () {
                var selectedSObjectIconCount = MapService.getSelectedSObjectIconCount($scope.initialMapConfig.sObjectsMetadata);
                if (selectedSObjectIconCount == 1) {
                    $scope.zoomMinus();
                }
            }, 150);
            // V3.0.PS1-T121 End
            // V2.0.CF-I106 end

            $scope.setTablePageSize(sObjectName, result.pageSize);
            LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
        };
        // V3.0_02-04-2019 END
    };

    // V2.0.CF-I122 start
    $scope.getRelatedObjects = function (sObjectName) {
        var relatedObjects = [];
        var currentRelatedObjects = $scope.initialMapConfig.relatedObjects;
        var isValidCurrentRelatedObjects = (currentRelatedObjects != null && currentRelatedObjects != '');

        /* check if initial config has property with name of mail object */
        if (isValidCurrentRelatedObjects && currentRelatedObjects.hasOwnProperty(sObjectName)) {

            /* get related objects for current object for initial config */
            var relatedObjectsNames = $scope.initialMapConfig.relatedObjects[sObjectName];

            /* collecting related object names for current main object */
            for (var i = 0; i < relatedObjectsNames.length; i++) {
                relatedObjects.push(relatedObjectsNames[i].name);
            }
        }
        return relatedObjects;
    };
    // V2.0.CF-I122 end

    // V2.0.CF-I86 start
    $scope.openExportWindow = function (allRecord) {
        $scope.iterableFieldsLead = [];
        $scope.iterableFieldsContact = [];
        $scope.iterableRecordsLead = [];
        $scope.iterableRecordsContact = [];
        $scope.buildColumnsArrayCmp();
        $scope.buildValuesArrayCmp(allRecord);
        if ($scope.iterableRecordsLead.length == 0 && $scope.iterableRecordsContact.length == 0) {
            MessageService.showMessageOnMap('Contacts or Leads not found', 'error');
        } else {
            // V2.0.CF-I105 start
            // V2.0.CF-I118 start
            $scope.showModal = true;
            $scope.addCampaignsStep = 1;
            $("#child_tables .loading-spinner").show();
            $scope.hideTooltip('search');
            $scope.hideTooltip('record');
            $scope.hideTooltip('object');
            $(".pageContainer ").addClass('hideSidebar');
            if ($('#tab-Lead').is('.active') || $('#tab-Contact').is('.active')) {
                $('.additionalBlock_left').css("left", '0');
            }
            var applyTableInterval = setInterval(function () {
                var done = $scope.applyDataTable();
            }, 500);
            // V2.0.CF-I118 end
            // V2.0.CF-I105 end
        }
    }

    //V2.0.CF-I148 Start
    $scope.openExportWindowLead = function (allRecord) {
        $scope.iterableFieldsLead = [];
        $scope.iterableFieldsContact = [];
        $scope.iterableRecordsLead = [];
        $scope.iterableRecordsContact = [];
        $scope.buildColumnsArrayCmp();
        $scope.buildValuesArrayCmp(allRecord);
        if ($scope.iterableRecordsLead.length == 0) {
            MessageService.showMessageOnMap('Leads not found', 'error');
        } else {
            // V2.0.CF-I105 start
            // V2.0.CF-I118 start
            $scope.showModallead = true;
            $scope.addCampaignsStep = 1;
            $("#child_tables .loading-spinner").show();
            $scope.hideTooltip('search');
            $scope.hideTooltip('record');
            $scope.hideTooltip('object');
            $(".pageContainer ").addClass('hideSidebar');
            if ($('#tab-Lead').is('.active') || $('#tab-Contact').is('.active')) {
                $('.additionalBlock_left').css("left", '0');
            }
            var applyTableInterval = setInterval(function () {
                var done = $scope.applyDataTable();
            }, 500);
        }
    }
    //V2.0.CF-I148 End
    // V2.0.CF-I86 end

    // V2.0.CF-I86 start
    // V2.0.CF-I105 start
    // V2.0.CF-I118 start
    $scope.applyDataTable = function () {
        var result = false;
        if ($scope.iterableRecordsLead.length > 0 && $scope.iterableRecordsContact == 0) {
            if (!$.fn.DataTable.isDataTable('.leadTable')) {
                $(".leadTable").DataTable({
                    "scrollY": "270px",
                    "scrollCollapse": true,
                    "paging": false,
                    "sScrollX": "100%",
                    "sScrollXInner": "110%",
                    "bScrollCollapse": true,
                    "fixedColumns": {
                        "leftColumns": 1
                    }
                });
                result = true;
            }
        } else if ($scope.iterableRecordsLead.length == 0 && $scope.iterableRecordsContact > 0) {
            if (!$.fn.DataTable.isDataTable('#contTable')) {
                $("#contTable").DataTable({
                    "scrollY": "270px",
                    "scrollCollapse": true,
                    "paging": false,
                    "sScrollX": "100%",
                    "sScrollXInner": "110%",
                    "bScrollCollapse": true,
                    "fixedColumns": {
                        "leftColumns": 1
                    }
                });
                result = true;
            }
        } else {
            var leadRes = false;
            var contRes = false;
            if (!$.fn.DataTable.isDataTable('#contTable')) {
                $("#contTable").DataTable({
                    "scrollY": "135px",
                    "scrollCollapse": true,
                    "paging": false,
                    "sScrollX": "100%",
                    "sScrollXInner": "110%",
                    "bScrollCollapse": true,
                    "fixedColumns": {
                        "leftColumns": 1
                    }
                });
                contRes = true;
            } else {
                contRes = true;
            }
            if (!$.fn.DataTable.isDataTable('.leadTable')) {
                $(".leadTable").DataTable({
                    "scrollY": "135px",
                    "scrollCollapse": true,
                    "paging": false,
                    "sScrollX": "100%",
                    "sScrollXInner": "110%",
                    "bScrollCollapse": true,
                    "fixedColumns": {
                        "leftColumns": 1
                    }
                });
                leadRes = true;
            } else {
                leadRes = true;
            }
            result = leadRes & contRes;
        }
        return result;
    }
    // V2.0.CF-I118 end
    // V2.0.CF-I86 end
    // V2.0.CF-I105 end

    // V2.0.CF-I144 start
    $scope.toggleAllCheckboxesLead = function () {
        $scope.mainAddLeadToCmpCheckbox = !$scope.mainAddLeadToCmpCheckbox;
        if ($scope.mainAddLeadToCmpCheckbox) {
            for (var record of $scope.iterableRecordsLead) {
                for (var field of Object.values(record)) {
                    if (field.isInput) {
                        field.value = true;
                    }
                }
            }
        } else {
            for (var record of $scope.iterableRecordsLead) {
                for (var field of Object.values(record)) {
                    if (field.isInput) {
                        field.value = false;
                    }
                }
            }
        }
    }

    $scope.toggleAllCheckboxesContact = function () {
        $scope.mainAddContToCmpCheckbox = !$scope.mainAddContToCmpCheckbox;
        if ($scope.mainAddContToCmpCheckbox) {
            for (var record of $scope.iterableRecordsContact) {
                for (var field of Object.values(record)) {
                    if (field.isInput) {
                        field.value = true;
                    }
                }
            }
        } else {
            for (var record of $scope.iterableRecordsContact) {
                for (var field of Object.values(record)) {
                    if (field.isInput) {
                        field.value = false;
                    }
                }
            }
        }
    }
    // V2.0.CF-I144 end

    // V2.0.CF-I86 start
    $scope.nextStep = function () {
        // V2.0.CF-I154 start
        if ($scope.addCampaignsStep == 1) {
            $scope.queryCampaignTypes();
        }
        // V2.0.CF-I154 end
        if ($scope.addCampaignsStep == 2 && !$scope.isCreateState) {
            $scope.addToSelectedCampaigns($scope.queriedCampaigns);
        }
        if ($scope.addCampaignsStep == 2 && $scope.selectedCampaigns.length == 0) {
            return;
        }
        if ($scope.addCampaignsStep == 2) {
            $scope.isCreateState = false;
            $scope.searchCampaignModel = {};
        }
        $scope.addCampaignsStep++;
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I154 start
    $scope.queryCampaignTypes = function () {
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getCampaignTypes',
            params: []
        };

        DataFactory.invokeRemoteAction(options).then((res) => {
            $scope.campaignTypes = res;
        }, (err) => {
            console.log(err);
        });
    }
    // V2.0.CF-I154 end

    $scope.previousStep = function () {
        if ($scope.addCampaignsStep == 2) {
            // V2.0.CF-I118 start
            var applyTableInterval = setInterval(function () {
                var contactTable = $("#contTable");
                var leadTable = $(".leadTable");
                $scope.applyDataTable();
                if (leadTable.length > 0 || contactTable.length > 0) {
                    clearInterval(applyTableInterval);
                }
            }, 300);
            // V2.0.CF-I118 end

        }
        if ($scope.addCampaignsStep == 3 && !$scope.isCreateState) {
            setTimeout(function () {
                $("#existingCampaignList").DataTable();
            }, 250);
        }
        $scope.addCampaignsStep--;
    }

    $scope.saveCampaignMembers = function () {
        var wrapper = $scope.buildSaveWrapper();

        var options = {
            url: 'ValgencfMAPPdev.PVMapController.assignLeadsOrContactsToCampaigns',
            params: [wrapper]
        };

        DataFactory.invokeRemoteAction(options).then((res) => {
            $scope.isFlowFinished = true;
            $scope.insertResult = res;
        }, (err) => {
            $scope.isFlowFinishedWithErr = true;
            $scope.insertResult = err;
        });
    }

    // V2.0.CF-I86 start
    $scope.buildSaveWrapper = function () {
        var res = {};
        res.leadIdsSet = $scope.getIterableLeadsIds();
        res.contactIdsSet = $scope.getIterableContactsIds();
        res.campaignWrapperList = $scope.buildCamapignWrapperList();
        return res;
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I86 start
    $scope.getIterableLeadsIds = function () {
        var res = [];
        for (var rec of $scope.iterableRecordsLead) {
            if (rec.selected.value) {
                res.push(rec.id.value);
            }
        }
        return res;
    }

    $scope.getIterableContactsIds = function () {
        var res = [];
        for (var rec of $scope.iterableRecordsContact) {
            if (rec.selected.value) {
                res.push(rec.id.value);
            }
        }
        return res;
    }
    // V2.0.CF-I86 end

    $scope.buildCamapignWrapperList = function () {
        var res = [];
        for (var cmp of $scope.selectedCampaigns) {
            var item = {};
            item.campaignsId = cmp.campaign.Id;
            item.status = cmp.status;
            item.overwriteStatus = cmp.owerWrite;
            res.push(item);
        }
        return res;
    }

    // V2.0.CF-I86 start
    $scope.buildColumnsArrayCmp = function () {
        var resultLead = [{ 'isInput': true }];
        var resultContact = [{ 'isInput': true }];
        var leadDataTable = $scope.sObjectDataTables.Lead;
        var contactDataTable = $scope.sObjectDataTables.Contact;
        if (leadDataTable) {
            var names = new Set();
            for (var i = 0; i < leadDataTable.sObjectFields.length; i++) {
                if (!names.has(leadDataTable.sObjectFields[i].name)) {
                    resultLead.push({ 'isInput': false, 'label': leadDataTable.sObjectFields[i].label, 'name': leadDataTable.sObjectFields[i].name });
                    names.add(leadDataTable.sObjectFields[i].name);
                }
            }
        }
        if (contactDataTable) {
            var names = new Set();
            for (var i = 0; i < contactDataTable.sObjectFields.length; i++) {
                if (!names.has(contactDataTable.sObjectFields[i].name)) {
                    resultContact.push({ 'isInput': false, 'label': contactDataTable.sObjectFields[i].label, 'name': contactDataTable.sObjectFields[i].name });
                    names.add(contactDataTable.sObjectFields[i].name);
                }
            }
        }
        $scope.iterableFieldsLead = resultLead;
        $scope.iterableFieldsContact = resultContact;
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I86 start
    $scope.buildColumnsArray = function (sobjectType) {
        var result = [{ 'isInput': true }];
        // V2.0.CF-T244 start
        for (var record of $scope.sObjectDataTables[sobjectType].sObjectFields) {
            result.push({ 'isInput': false, 'label': record.label, 'name': record.name });
        }
        // V2.0.CF-T244 end
        $scope.iterableFields = result;
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I86 start
    $scope.buildValuesArrayCmp = function (allRecord) {
        var isContainsLeads = false;
        var isContainsContacts = false;
        if (allRecord) {
            // V2.0.CF-T244 start
            if ($scope.sObjectDataTables.Lead) {
                $scope.selectedLeads = $scope.sObjectDataTables.Lead.filtered;
            }
            if ($scope.sObjectDataTables.Contact) {
                $scope.selectedContacts = $scope.sObjectDataTables.Contact.filtered;
            }
            // V2.0.CF-T244 end
        }
        for (key of Object.keys($scope.sObjectDataTables)) {
            if (key == "Lead") {
                isContainsLeads = true;
            }
            if (key == "Contact") {
                isContainsContacts = true;
            }
        }

        if (isContainsLeads) {
            for (let item of $scope.selectedLeads) {
                var record = {};
                record.id = { 'isInput': false, 'value': item.Id };
                record.selected = { 'isInput': true, 'value': true };
                for (var field of $scope.iterableFieldsLead) {
                    if (field.name) {
                        record[field.name] = { 'isInput': false, 'value': item[field.name] }
                    }
                }
                $scope.iterableRecordsLead.push(record);
            }
        }
        if (isContainsContacts) {
            for (let item of $scope.selectedContacts) {
                var record = {};
                record.id = { 'isInput': false, 'value': item.Id };
                record.selected = { 'isInput': true, 'value': true };
                for (var field of $scope.iterableFieldsContact) {
                    if (field.name) {
                        record[field.name] = { 'isInput': false, 'value': item[field.name] }
                    }
                }
                $scope.iterableRecordsContact.push(record);
            }
        }
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I86 start
    $scope.buildValuesArray = function (allRecord, sobjectType) {
        var records = []
        if (allRecord) {
            // V2.0.CF-T244 start
            if (sobjectType == 'Lead') {
                $scope.selectedLeads = $scope.sObjectDataTables.Lead.filtered;
            } else {
                $scope.selectedContacts = $scope.sObjectDataTables.Contact.filtered;
            }
            // V2.0.CF-T244 end
        }

        if (sobjectType == 'Lead') {
            for (let item of $scope.selectedLeads) {
                var record = {};
                record.id = { 'isInput': false, 'value': item.Id };
                record.selected = { 'isInput': true, 'value': true };
                for (var field of $scope.iterableFields) {
                    if (field.name) {
                        record[field.name] = { 'isInput': false, 'value': item[field.name] }
                    }
                }
                $scope.iterableRecords.push(record);
            }
        } else {
            for (let item of $scope.selectedContacts) {
                var record = {};
                record.id = { 'isInput': false, 'value': item.Id };
                record.selected = { 'isInput': true, 'value': true };
                for (var field of $scope.iterableFields) {
                    if (field.name) {
                        record[field.name] = { 'isInput': false, 'value': item[field.name] }
                    }
                }
                $scope.iterableRecords.push(record);
            }
        }
    }
    // V2.0.CF-I86 end

    // V2.0.CF-I104 start
    $scope.hideModal = function () {
        $scope.addCampaignsStep = 0;
        $scope.selectedCampaigns = [];
        $scope.cmpSearchResults = false;
        $scope.queriedCampaigns = [];
        $scope.showModal = false;
        $scope.isFlowFinished = false;
        $scope.showModallead = false;
        // V2.0.CF-I144 start
        $scope.mainAddContToCmpCheckbox = true;
        $scope.mainAddLeadToCmpCheckbox = true;
        // V2.0.CF-I144 end
    }
    // V2.0.CF-I104 end

    $scope.fetchCampaigns = function () {
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.findCampaignsByParams',
            params: [$scope.searchCampaignModel]
        };
        $("#selectCampaign .loading-spinner").show();

        DataFactory.invokeRemoteAction(options).then((res) => {
            $scope.cmpSearchResults = true;
            var queriedData = [];
            for (var rec of res) {
                var record = [];
                record.push({ 'name': 'Selected', 'isDisplay': true, 'isInput': true, 'value': false });
                record.push({ 'name': 'Name', 'isDisplay': true, 'isInput': false, 'value': rec.Name });
                record.push({ 'name': 'Status', 'isDisplay': true, 'isInput': false, 'value': rec.Status });
                record.push({ 'name': 'StartDate', 'isDisplay': true, 'isInput': false, 'value': new Date(rec.StartDate).toLocaleDateString("en-US") });
                record.push({ 'name': 'EndDate', 'isDisplay': true, 'isInput': false, 'value': new Date(rec.EndDate).toLocaleDateString("en-US") });
                record.push({ 'name': 'isActive', 'isDisplay': true, 'isInput': false, 'value': rec.IsActive });
                record.push({ 'name': 'Id', 'isDisplay': false, 'isInput': false, 'value': rec.Id });
                queriedData.push(record);
            }
            $scope.queriedCampaigns = queriedData;
            $("#selectCampaign .loading-spinner").hide();
            setTimeout(function () {
                $("#existingCampaignList").DataTable();
            }, 500);

        }, (err) => {
            $("#selectCampaign .loading-spinner").hide();
            console.log(err);
        });
    }

    $scope.changeCampaignFilterCondition = function () {
        $scope.cmpSearchResults = false;
        $scope.addToSelectedCampaigns($scope.queriedCampaigns);
        $scope.queriedCampaigns = [];
    }

    $scope.addToSelectedCampaigns = function (campaigns) {
        for (var record of campaigns) {
            var campaign = $scope.arrayToCampaignObject(record);
            if (campaign.Selected) {
                $scope.selectedCampaigns.push($scope.createCampaignWrapper(campaign));
            }
        }
    }

    $scope.arrayToCampaignObject = function (rec) {
        var obj = {};
        for (var field of rec) {
            obj[field.name] = field.value;
        }
        return obj;
    }

    $scope.onSObjectRecordSearch = function (sObjectName, searchVal) {
        //LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.app);
        var sObjectRecords;
        if ($scope.colorBoxData.isActive) {
            sObjectRecords = MapDashboardService.getVisibleDashboardRecords($scope.colorBoxData,
                $scope.sObjectDataTables[$scope.colorBoxData.sObjectName].rows);
        } else {
            sObjectRecords = $scope.sObjectDataTables[sObjectName].rows;
        }

        $scope.sObjectDataTables[sObjectName].filtered = MapService.getSObjectRecordsBySearchCriteria($scope.sObjectDataTables[sObjectName].rows,
            searchVal,
            $scope.sObjectDataTables[sObjectName].pageSize);
        // V2.0.CF-I32 start
        updateSummary(sObjectName);
        // V2.0.CF-I32 end
        onBottomListSearchShowHideMarkers($scope.sObjectDataTables[sObjectName].filtered, sObjectName);

        //LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 150);
    };

    $scope.removeSelectedCampaign = function (index) {
        $scope.selectedCampaigns.splice(index, 1);
    }

    // $scope.validateAndSaveNewCampaign = function() {
    //     $scope.createdCampaign = null;
    //     $scope.createdCampaignErr = null;
    //     var options = {
    //         url: 'ValgencfMAPPdev.PVMapController.createCampaignWithParams',
    //         params: [$scope.newCampaign]
    //     };
    //     $("#createCampaign .loading-spinner").show();
    //     DataFactory.invokeRemoteAction(options).then((res) => {
    //         $("#createCampaign .loading-spinner").hide();
    //     $scope.createdCampaign = res;
    //     $scope.selectedCampaigns.push($scope.createCampaignWrapper(res));
    // }, (reason) => {
    //         $("#createCampaign .loading-spinner").hide();
    //         $scope.createdCampaignErr = reason;
    //     });
    // }

    //V2.0.CF-I148 Start
    $scope.assignLeadOwner = function () {
        var selectedOwnerId = $("input[name='selected_owner']:checked").prop('id').split('_')[1];
        var selectedLeads = [];
        $(".lead_owner_table_select:checked").each(function (i, v) {
            selectedLeads.push(v.id);
        });
        $(".alert-success").hide();
        $(".alert-error").hide();
        $scope.remote_assignLeadOwner(selectedOwnerId, selectedLeads);
    }

    $scope.remote_assignLeadOwner = function (selectedOwner, selectedLeads) {
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.assignLeadOwner',
            params: [selectedOwner, selectedLeads]
        };
        $("#lead_owner_assignment .loading-spinner").show();

        DataFactory.invokeRemoteAction(options).then((res) => {
            $scope.handleLeadAssignResponse(res);
            $("#lead_owner_assignment .loading-spinner").hide();
        });
    }

    $scope.handleLeadAssignResponse = function (response) {
        if (response.status === 'success') {
            $(".owner_change.alert-error").hide();
            $(".owner_change.alert-success").show();
            $(".owner_change.alert-success").text(response.message);
            $('.finish-btn').hide();
            $('.cancel-btn').hide();
            $('.close-btn').show();
        } else {
            $('.owner_change.alert-success').hide();
            $('.owner_change.alert-error').show();
            $('.owner_change.alert-error').text(response.message);
        }
    }

    $scope.populateChangedOwner = function () {
        var selectedOwnerId = $("input[name='selected_owner']:checked").prop('id').split('_')[1];
        var selectedOwnerName = $("input[name='selected_owner']:checked").val();
        for (var i = 0, size = $scope.leadIdsUnderTheShape.length; i < size; i++) {
            var r = 'row_' + $scope.leadIdsUnderTheShape[i];

            lookup[r]['sRecord']['Owner']['Name'] = selectedOwnerName;
            lookup[r]['sRecord']['Owner']['Id'] = selectedOwnerId;
        }
        $scope.createLeadTableForSelectedShape();
    }

    $scope.createLeadTableForSelectedShape = function () {
        if ($scope.leadIdsUnderTheShape.length == 0) {
            $(".owner_change.alert-error").text('No Lead(s) found.');
            $(".owner_change.alert-error").show();
            $("#lead_selection").hide();
            $("#change_owner").hide();
            return;
        } else {
            $("#lead_selection").show();
            $("#change_owner").show();
        }
        var tableId = 'lead_owner_table';
        var recordCount = 0;

        var myData = new Array();
        for (var i = 0, size = $scope.leadIdsUnderTheShape.length; i < size; i++) {
            if (idGraphicMap[$scope.leadIdsUnderTheShape[i]].visible == true) {
                var row = [];
                var r = 'row_' + $scope.leadIdsUnderTheShape[i];
                if (lookup[r] == undefined) continue;
                var name = lookup[r]['sRecord']['Name'];
                var checkbox = '<input type="checkbox" checked="checked" class="' + tableId + '_select"' + 'id="sel_' + $scope.leadIdsUnderTheShape[i] + '"/>';
                row.push(checkbox);
                row.push(name);
                var owner = lookup[r]['sRecord']['Owner']['Name'];
                row.push(owner);
                myData.push(row);
                recordCount++;
            }
        }

        var recordCountInfo = 'Total ' + recordCount + ' lead records found';
        recordCountInfo = '<div class="record-count-info">' + recordCountInfo + '</div>';
        $("#leads_table_wrap").html(recordCountInfo + '<table id="lead_owner_table" class="filter_table"/>');

        var columnRow = {};
        var columns = [];
        columnRow = {};
        columnRow['title'] = '<input type="checkbox" checked="checked" class="' + tableId + '_selectAll"  />';
        columns.push(columnRow);
        columnRow = {};
        columnRow['title'] = 'Lead Name';
        columns.push(columnRow);
        columnRow = {};
        columnRow['title'] = 'Lead Owner';
        columns.push(columnRow);
        var thisTable = $('#' + tableId).DataTable({
            "data": myData,
            "columns": columns,
            "destroy": true,
            "searching": false,
            "columnDefs": [{
                "targets": [0],
                "searchable": false,
                orderable: false
            }],
            "scrollCollapse": true,
            "scrollY": "100px",
            paging: false
        });
        $("." + tableId + "_selectAll").click(function () {
            if ($(this).prop('checked')) {
                $("." + tableId + "_select").prop("checked", true);
            } else {
                $("." + tableId + "_select").prop("checked", false);
            }
        });
        $("." + tableId + "_select").click(function () {
            if ($("." + tableId + "_select").length == $("." + tableId + "_select:checked").length) {
                $("." + tableId + "_selectAll").prop('checked', true);
            } else {
                $("." + tableId + "_selectAll").prop('checked', false);
            }
        });
    }

    $scope.remote_getUserMap = function (input, option) {
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getUserMap',
            params: [input, option.value]
        };

        $("#lead_owner_assignment .loading-spinner").show();

        DataFactory.invokeRemoteAction(options).then((res) => {
            $scope.handleUserMapResponse(res);
            $("#lead_owner_assignment .loading-spinner").hide();
        });
    }

    $scope.handleUserMapResponse = function (userMap) {
        var tableData = [];
        for (var i in userMap) {
            var row = [];
            if (userMap[i] != undefined) {
                var radioHtml = '<input type="radio" value="' + userMap[i] + '" name="selected_owner" id="user_' + i + '">'
                row.push(radioHtml);
                row.push(userMap[i]);
                tableData.push(row);
            }
        }

        $("#user_table_Wrap").html("<table id='user_table'/>");
        var thisTable = $('#user_table').DataTable({
            "data": tableData,
            "destroy": true,
            "searching": false,
            "columnDefs": [{
                "targets": [0],
                "visible": true,
                "searchable": false
            }, {
                "targets": [1],
                "visible": true,
                "searchable": false
            }],
            "scrollCollapse": true,
            "scrollY": "100px",
            paging: false
        });
        $('#user_table tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                thisTable.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $(this).find("input[name='selected_owner']").prop('checked', true);
            }
        });
    }

    $scope.searchOwner = function (searchKey) {
        if (searchKey.length > 3) {
            remote_getUserMap();
        }
    }

    $scope.clearUserTable = function () {
        $("#user_table_Wrap").html(null);
    }
    //V2.0.CF-I148 End

    // V2.0.CF-I92 start
    function updateHeaderState(sObjectName) {
        var tabId = '#tab-' + sObjectName;
        var header = '.header-' + sObjectName;
        var isSameTabActive = $(tabId).hasClass('active');
        if (isSameTabActive) {
            for (let objName in $scope.sObjectDataTables) {
                var headerName = '.header-' + objName;
                $(headerName).css("visibility", "hidden");
            }
            $(header).css("visibility", "visible");
        } else {
            $(header).css("visibility", "hidden");
        }
    }
    // V2.0.CF-I92 end

    function switchBottomPanel(tabId, panelId) {
        var isSameTabActive = $(tabId).hasClass('active');
        //console.log(isSameTabActive);
        if (isSameTabActive) {
            $('.objectListContainer').removeClass('active');
            $(tabId).removeClass('active');
            $(".esriSimpleSliderBR").css("bottom", "75px");
            hideBottomPanel();
        } else {
            $('.object-tabs__item-link').removeClass('active');
            $(tabId).addClass('active');
            $('.listViewTabPanelContainer div').removeClass('active');
            //console.log($('.tabPanel-'+sObjectName));
            $(panelId).addClass('active');
            //$('.objectListContainer').addClass('active');
            $('.objectListContainer').addClass('active');
            $("#map_zoom_slider").css("bottom", "350px");
            showBottomPanel();
        }
    }

    $scope.showhidefullscreen = function () {
        var isSameTabActive = $('.objectListContainer ').hasClass('active');

        //console.log(isSameTabActive);
        if (isSameTabActive) {
            $('.objectListContainer').removeClass('active');
            $('.object-tabs__item-link').removeClass('active');
            // $('.objectListContainer active').removeClass('active');
            $(".esriSimpleSliderBR").css("bottom", "75px");
            for (let objName in $scope.sObjectDataTables) {
                var headerName = '.header-' + objName;
                $(headerName).css("visibility", "hidden");
            }
            hideBottomPanel();
        }
        var sideBar = $(".pageContainer ");
        console.log('sideBar');
        console.log(sideBar);
        console.log(sideBar.hasClass('hideSidebar'));
        if (!sideBar.hasClass('hideSidebar')) {
            sideBar.toggleClass('hideSidebar');
            var headers = $(".tableFloatingHeaderOriginal");
            if (headers) {
                for (var header of headers) {
                    var selector = '.' + header.classList[0];
                    var thead = $(selector);
                    var currentVal = header.offsetLeft;
                    if (!sideBar.hasClass('hideSidebar')) {
                        thead.css("left", currentVal + 400);
                    } else {
                        thead.css("left", currentVal - 400);
                    }
                }
            }
            $timeout(function () {
                var tbl = $('#wrapBottomTable');
                tbl.trigger('resize');
            }, 150);
        }
    }

    function showBottomPanel() {
        $('.togglerWrapper').css("margin-top", tableHeight);
        // V2.0.CF-I127 start
        $('.additionalBlock').css("visibility", 'visible');
        // V2.0.CF-I127 end
        var tableHeight = $('.bordered')[0].clientHeight;
        var height = getEsriMapHeight() - tableHeight;
        $('.togglerWrapper').css("margin-top", tableHeight);
        $('#map').css("height", height);
    }

    function hideBottomPanel() {
        // V2.0.CF-I127 start
        $('.additionalBlock').css("visibility", 'hidden');
        // V2.0.CF-I127 end
        var tableHeight = $('.bordered')[0].clientHeight;
        var height = getEsriMapHeight() - tableHeight;
        $('.togglerWrapper').css("margin-top", 0);
        $('#map').css("height", height + tableHeight);
    }

    $scope.isAccessible = function () {
        return $scope.hasAccess;
    };

    // V2.0.CF-I94 start
    $scope.showBottomListViewsObjectTabPanel = function (sObjectName) {
        switchBottomPanel('#tab-' + sObjectName, '#tabPanel-' + sObjectName);
        updateHeaderState(sObjectName);
        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 450);

        if ($('#tab-Lead').is('.active')) {
            $('.additionalBlock_left').css('visibility', 'visible');
            $timeout(function () {
                $('#scrollable-area').scrollLeft(0);
            }, 100);
        } else if ($('#tab-Contact').is('.active')) {
            $('.additionalBlock_left').css('visibility', 'visible');
            $timeout(function () {
                $('#scrollable-area').scrollLeft(10);
            }, 100);
            $timeout(function () {
                $('#scrollable-area').scrollLeft(0);
            }, 10);
            $timeout(function () {
                $('#scrollable-area').scrollTop(10);
            }, 100);
            $timeout(function () {
                $('#scrollable-area').scrollTop(0);
            }, 10);
        } else {
            $('.additionalBlock_left').css('visibility', 'hidden');
        }

        $timeout(function () {
            $('#scrollable-area').scrollLeft(0);
        }, 500);
        $timeout(function () {
            $('#scrollable-area').scrollTop(0);
        }, 500);
    };
    // V2.0.CF-I94 end

    $scope.showBottomPluginTab = function (index) {
        switchBottomPanel('#pluginTab' + index, '#pluginPanel' + index);
    }

    // V2.0.CF-I141 start
    $scope.showDataValueByFieldDataType = function (value, dataType, isMasked = false) {
        var timeZoneStr = '';
        if ($scope.initialMapConfig && $scope.initialMapConfig.userTimeZone)
            timeZoneStr = "'" + $scope.initialMapConfig.userTimeZone.offset + "'";
        if (value) {
            if (dataType == 'DATETIME')
                value = $filter('date')(value, "MM/dd/yyyy 'at' h:mma", timeZoneStr);
            else if (dataType == 'DATE')
                value = $filter('date')(value, 'mediumDate');
            else if (dataType == 'CURRENCY')
                value = $filter('currency')(value, '$');
        }
        if (value != undefined && isMasked && (
            dataType == 'BOOLEAN' || dataType == 'INTEGER' || dataType == 'CURRENCY' || dataType == 'DOUBLE' || dataType == 'PERCENT')) {
            value = 'Masked';
        }
        return value;
    }
    // V2.0.CF-I141 end

    $scope.onSidebarItemClick = function (record, sObjectName, sObjectData) {
        var selectedObjectGraphic = DataFactory.getsObjectGraphicsByObjectRecordId(sObjectName, record.Id) || g_esri.map.getLayer($scope.primaryLocationLayerId).graphics[0];
        if (selectedObjectGraphic) {
            resetAllMarkers();
            showInfoWindow(selectedObjectGraphic);
            g_esri.map.infoWindow.setFeatures([selectedObjectGraphic]);
            highlightMarker(selectedObjectGraphic);
            g_esri.map.centerAt(selectedObjectGraphic.geometry);
        }
        $scope.showDetailPage(record, sObjectName, sObjectData);
    }

    $scope.getSobjectLabelByName = function (sObjectName) {
        var sObjectLabel = sObjectName;
        angular.forEach($scope.initialMapConfig.sObjectsMetadata, function (rec) {
            if (rec.name == sObjectName) {
                sObjectLabel = rec.label;
            }
        });
        return sObjectLabel;
    }

    $scope.showDetailPage = function (record, sObjectName, sObjectData) {
        PluginsService.currentLeftSideDirective.showPluginTab = false;
        //alert('in detail page');
        LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.detailPage);
        $('.topSection').slideUp('fast');
        alignSidebar();
        MessageService.hideMessageOnDetailPage();

        var detailPage = {};
        if (record != null) {
            detailPage['record'] = record;
            detailPage['editRecord'] = angular.copy(record);
        }

        detailPage['sObjectName'] = sObjectName;
        detailPage.fields = sObjectData.sObjectFields;
        detailPage.action = {
            rows: sObjectData.actions.filter(function (action) {
                return action.name !== 'Weather'
            }),
            currentPage: 1,
            pageSize: 6
        };
        if ($scope.isRelatedState && record.Id == $scope.relatedMainRecordId) {
            var path = $scope.imagePath.related_records_action;
            detailPage.action.rows.push({ name: 'Related_Records', label: 'Related Records', imgPath: path });
        }

        console.log(sObjectData);

        detailPage.logo = getLogo(sObjectData.logoMetaData, record, sObjectData.hasAccessToLogo);
        detailPage['sObjectLabel'] = $scope.getSobjectLabelByName(sObjectName);

        $q.all([
            populateWeatherDetails(record, sObjectData.hasAccessToWeather, sObjectData.latitudeFieldName, sObjectData.longitudeFieldName).then(
                function (result) {
                    detailPage.weatherDetails = result;
                    return $q.resolve(result);
                }
            ),
            // V3.0.CF-I196 start
            fetchActivityHistory(record && record.Id ? record.Id : null, 0, 5).then(
                // V3.0.CF-I196 end
                function (result) {
                    detailPage.activity = result;
                    return $q.resolve(result);
                }
            )
        ]).then(function (results) {
            $('#LeftSidebar_ResultList').hide();
            $('#LeftSidebar_DetailPage').show();
            $('#detailPageBackIconId').show();
            $('#detailPageBackIconId').addClass('showBackBtn');
            $('#detailPageAllRecordsHeaderId').hide();
            LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
            $('#detailPageSidebarScrollerId').mCustomScrollbar("scrollTo", 'top', {
                scrollInertia: 300
            });

            if ($scope.leftSidebar.detailPage.fields && sObjectData.GDPRFields) {
                angular.forEach($scope.leftSidebar.detailPage.fields, function (field) {
                    angular.forEach(sObjectData.GDPRFields, function (gdprField) {
                        if (field && gdprField && gdprField.field && field.name == gdprField.field.name) {
                            field.owner = 'app';
                        }
                    });
                });
            }
        },
            function (error) {
                //console.log(error);
                MessageService.showMessageOnDetailPage(error, 'error');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
            }
        )

        $scope.leftSidebar.detailPage = detailPage;
        $scope.leftSidebar.detailPage.isEdit = false;
    }

    $scope.showDashboardPublishedData = function (selectedPublishedSegment, sObjectName) {
        //console.log('showDashboardPublishedData==');
        if (selectedPublishedSegment) {
            LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.app);
            if ($scope.colorBoxData.isActive) {
                //console.log('reset==');
                resetMarkerColorAndBottomListData(sObjectName);
            }

            var primaryMarkerLocation = LocationFactory.getPrimaryMarkerObjData();
            getDashboardPublishedData(selectedPublishedSegment.id,
                $scope.initialMapConfig.adminSettingRecId,
                primaryMarkerLocation)
                .then(function (dashboardCompData) {
                    generateDashboardColorBoxAndChangeExistingMarkerColor(dashboardCompData);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);

                }, function (error) {
                    //console.log(error);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                })
        }
    }

    $scope.checkIfAllColorBoxSelected = function () {
        //console.log('checkIfAllColorBoxSelected==');
        $scope.colorBoxData.selectedAllColorBox = $scope.colorBoxData.rows.every(function (rec) {
            return rec.selected == true
        })
    }

    $scope.selectAllColorBox = function (sObjectName) {
        //LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.app);
        //var toggleStatus = !$scope.dashboardComponentData.colorBoxData.selectedAllColorBox;
        //alert('selectAllColorBox=='+$scope.dashboardComponentData.colorBoxData.selectedAllColorBox);
        var markerGraphicRecordIds = [];
        angular.forEach($scope.colorBoxData.rows, function (rec) {

            //alert(rec.selected);
            if (rec.selected != $scope.colorBoxData.selectedAllColorBox) {
                rec.selected = $scope.colorBoxData.selectedAllColorBox;
                markerGraphicRecordIds = markerGraphicRecordIds.concat(rec.markerGraphicRecordIds);
            }
        });

        if (markerGraphicRecordIds.length > 0)
            $scope.onCheckBoxChangeShowHidePins($scope.colorBoxData.selectedAllColorBox, markerGraphicRecordIds, sObjectName);
        //LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
    };

    $scope.onCheckBoxChangeShowHidePins = function (isChecked, markerGraphicRecordIds, sObjectName) {
        var newSobjectRecordsToShowOnMap = [];
        if (isChecked) {
            // Find additional bottom listData
            newSobjectRecordsToShowOnMap = MapService.findsObjectRecordsBySetOfRecordIds($scope.sObjectDataTables[sObjectName].rows,
                markerGraphicRecordIds);

            newSobjectRecordsToShowOnMap = MapService.getSObjectRecordsBySearchCriteria(newSobjectRecordsToShowOnMap,
                $scope.sObjectDataTables[sObjectName].searchStr,
                $scope.sObjectDataTables[sObjectName].pageSize);

            // Show marker on map
            for (var i = 0, tot = newSobjectRecordsToShowOnMap.length; i < tot; i++) {
                var sObjectMarkerGraphic = DataFactory.getsObjectGraphicsByObjectRecordId(sObjectName, newSobjectRecordsToShowOnMap[i].Id);
                if (sObjectMarkerGraphic)
                    sObjectMarkerGraphic.show();
            }
            newSobjectRecordsToShowOnMap = $scope.sObjectDataTables[sObjectName].filtered.concat(newSobjectRecordsToShowOnMap);
            $scope.sObjectDataTables[sObjectName].filtered = newSobjectRecordsToShowOnMap;
            // V2.0.CF-I32 start
            updateSummary(sObjectName);
            // V2.0.CF-I32 end
        } else if (!isChecked) {
            //console.log($scope.sObjectDataTables[sObjectName].filtered);
            newSobjectRecordsToShowOnMap = MapService.findsObjectRecordsByRemovingSetOfRecords($scope.sObjectDataTables[sObjectName].filtered,
                markerGraphicRecordIds);
            //hide Marker on Map

            for (var i = 0, tot = markerGraphicRecordIds.length; i < tot; i++) {
                var sObjectMarkerGraphic = DataFactory.getsObjectGraphicsByObjectRecordId(sObjectName, markerGraphicRecordIds[i]);
                if (sObjectMarkerGraphic)
                    sObjectMarkerGraphic.hide();
            }

            $scope.sObjectDataTables[sObjectName].filtered = [];
            $scope.sObjectDataTables[sObjectName].filtered = newSobjectRecordsToShowOnMap;
            // V2.0.CF-I32 start
            updateSummary(sObjectName);
            // V2.0.CF-I32 end
        }
        $scope.leftSidebar.records = newSobjectRecordsToShowOnMap;
    }

    function toggleAllMarkers(methodName) {
        var markers = DataFactory.getAllsObjectGraphics();
        angular.forEach(markers, function (value, key) {
            if (key !== $scope.primaryLocationLayerId) {

                Object.values(value).forEach(function (graphic) {
                    graphic[methodName]();
                })
            } else {
                value[methodName]();
            }
        })
    }

    $scope.closeColorBox = function () {
        if ($scope.colorBoxData && $scope.colorBoxData.sObjectName) {
            var markers = DataFactory.getAllsObjectGraphics();
            for (var markerIndex in markers[$scope.colorBoxData.sObjectName]) {
                markers[$scope.colorBoxData.sObjectName][markerIndex].attributes.originalSymbol = undefined;
            }
            toggleAllMarkers('show');
            resetMarkerColorAndBottomListData($scope.colorBoxData.sObjectName);
            // V2.0.CF-I126 start
            $scope.sObjectDataTables[$scope.colorBoxData.sObjectName].pageSize = '50';
            // V2.0.CF-I126 end
        }

        hideAndClearColorboxData();
        /*
        if($scope.dashboardComponentData.isActive){

            $scope.dashboardComponentData.isActive = false;

            if($scope.dashboardComponentData && $scope.dashboardComponentData.sObjectName){

                resetMarkerColorAndBottomListData($scope.dashboardComponentData.sObjectName);
            }
            //alert(JSON.stringify($scope.dashboardComponent));
            $scope.dashboardComponent = {};
            $scope.publishedSegment = {};
        }
        else if($scope.topTenOccurance.isActive){

            $scope.topTenOccurance.isActive = false;

        }*/
    }

    $scope.checkIfAllTopTenColorBoxSelected = function () {
        //console.log('checkIfAllColorBoxSelected==');
        $scope.topTenOccurance.selectedAllColorBox = $scope.topTenOccurance.rows.every(function (rec) {
            return rec.selected == true
        })
    }

    $scope.showTopTenFeature = function (sObjectName, fieldName, fieldLabel) {
        var sObjectMarkerData = $scope.sObjectDataTables[sObjectName];
        var allOcurranceOfSobjectField = MapTopTenFeatureService.getAllOccuranceOfSobjectFieldByDesc(sObjectMarkerData, fieldName, fieldLabel);
        $scope.colorBoxData = MapTopTenFeatureService.generateColorBoxOfTopTenFeature(allOcurranceOfSobjectField,
            $scope.initialMapConfig.topTenColors,
            fieldName, fieldLabel, sObjectName,
            G_MARKER_PATH.secondary);
        // Hide sObject marker on Map
        toggleAllMarkers('hide');

        //console.log($scope.colorBoxData);
        // Find Bottom ListView Data && show marker On Map.
        var sObjectRecordsToShowOnMap = MapTopTenFeatureService.getTopTenFeatureRecords($scope.colorBoxData.rows, sObjectMarkerData);
        // Show Marker on map
        for (var i = 0, tot = sObjectRecordsToShowOnMap.length; i < tot; i++) {
            var sObjectMarkerGraphic = DataFactory.getsObjectGraphicsByObjectRecordId(sObjectName, sObjectRecordsToShowOnMap[i].Id);
            if (sObjectMarkerGraphic)
                sObjectMarkerGraphic.show();
        }

        $scope.sObjectDataTables[sObjectName].filtered = sObjectRecordsToShowOnMap;
        // V2.0.CF-I32 start
        updateSummary(sObjectName);
        // V2.0.CF-I32 end
        $scope.leftSidebar["records"] = sObjectRecordsToShowOnMap;

        $scope.colorBoxData.isActive = true;
        $('#ColorBoxId').show();
        $('.markers').mCustomScrollbar({
            theme: "dark",
            autoHideScrollbar: true
        });

        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 450);
        //$("TopTenColorBoxId").show();
    }

    $scope.showMoreActivities = function (recordId) {
        LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.detailPage);
        recordStartIndex = $scope.leftSidebar.detailPage.activity.currentEndIndex;
        recordEndIndex = recordStartIndex + 5;
        fetchActivityHistory(recordId, recordStartIndex, recordEndIndex)
            .then(function (result) {
                var activity = {};
                activity.activityHistories = $scope.leftSidebar.detailPage.activity.activityHistories.concat(result.activityHistories);
                activity.hasMoreActivity = result.hasMoreActivity;
                activity.currentStartIndex = recordStartIndex;
                activity.currentEndIndex = recordEndIndex;
                activity.isEnabledActivities = false;
                $scope.leftSidebar.detailPage.activity = activity;
                //console.log("Detail page activity");
                //console.log($scope.leftSidebar.detailPage.activity);
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
            },
                function (error) {
                    //console.log(error);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
                })
    }

    $scope.isNextDisabled = function () {
        var slidesQuantity = Math.ceil($scope.leftSidebar.detailPage.action.rows.length / $scope.leftSidebar.detailPage.action.pageSize);
        return $scope.leftSidebar.detailPage.action.currentPage == slidesQuantity || slidesQuantity === 1;
    }

    // V2.0.CF-T235 star
    $scope.showToolbar = function () {
        $scope.currentAction = $scope.imagePath.poligon;
        var currentZoom = g_esri.map.getZoom()
        $scope.zoomValue = currentZoom;
        $scope.isToolbarDisplay = true;
    }
    // V2.0.CF-T235 start

    $scope.isBackDisabled = function () {
        var slidesQuantity = Math.ceil($scope.leftSidebar.detailPage.action.rows.length / $scope.leftSidebar.detailPage.action.pageSize);
        return $scope.leftSidebar.detailPage.action.currentPage == 1 || slidesQuantity === 1;
    }

    $scope.nextActions = function () {
        $scope.leftSidebar.detailPage.action.currentPage = $scope.leftSidebar.detailPage.action.currentPage + 1;
    };

    $scope.backActions = function () {
        $scope.leftSidebar.detailPage.action.currentPage = $scope.leftSidebar.detailPage.action.currentPage - 1;
    };

    $scope.invokeAction = function (sObjectName, actionType, recordId) {
        var selectedSobject = $scope.sObjectDataTables[sObjectName];
        var record = MapService.SearchArrayByAttribute(selectedSobject.rows, recordId, 'Id');
        var address = MapActionService.populateAddress(record, selectedSobject.addressField, selectedSobject.parentRelationshipName);
        var name = record['Name'];
        var company = record['Company'];
        var relatedId = 'what_id';
        if (sObjectName == 'Contact' || sObjectName == 'Lead')
            relatedId = 'who_id';
        //console.log('action called');

        // V2.0.CF-T244 start
        if (actionType != 'Related_Records') {
            // V2.0.CF-T244 end
            var actionDetails = MapActionService.getActionUrlAndRedirectInstruction(sObjectName, actionType, recordId, name, address, company, relatedId);
            recordIdd = '_' + recordId;
            if ((typeof sforce != 'undefined') && (sforce != null)) {
                // Salesforce1 navigation
                if (actionDetails.isRedirectPage)
                    sforce.one.navigateToURL(actionDetails.url)
                else
                    sforce.one.navigateToURL(actionDetails.url, true)
                //window.open(url,'_blank');
            } else {
                // salesforce desktop navigation
                //window.parent.location.href= url;
                window.open(actionDetails.url, '_blank');
            }
            // V2.0.CF-T244 start
        } else {
            if (!$scope.isRelatedState) {
                if ($scope.relatedRecordsConditions && $scope.relatedRecordsConditions[sObjectName] && $scope.checkIsRelatedConditionIsValid($scope.relatedRecordsConditions[sObjectName])) {
                    var deferred = $q.defer();
                    $timeout(function () {
                        $scope.getRelatedRecords(deferred, recordId, record, sObjectName);
                    }, 100);
                    // V3.0.CF-I231 START
                    deferred.promise.then(function () {
                        $timeout(function () {
                            $('#wrapBottomTable').data('plugin_stickyTableHeaders').destroy();
                            $('#wrapBottomTable').stickyTableHeaders({ "scrollableArea": $('#scrollable-area'), "fixedOffset": 2 });
                            $('.tableFloatingHeaderOriginal').css('visibility', 'hidden');
                        }, 500);
                    });
                    // V3.0.CF-I231 END
                } else {
                    MessageService.showMessageOnMap('Related records condition is empty', 'error');
                }
            } else {
                $scope.returnToMainRecords(record);
            }
        }
        // V2.0.CF-T244 end
    }

    // V2.0.CF-T244 start
    $scope.checkIsRelatedConditionIsValid = function (condition) {
        return condition.srcField && condition.relatedObject && condition.relatedObjectField;
    }
    // V2.0.CF-T244 end

    $scope.navigateurl = function (recordid) {
        if ((typeof sforce != 'undefined') && (sforce != null))
            sforce.one.navigateToSObject(recordid, view)
    }
    
    // V2.0.CF-T244 start
    $scope.returnToMainRecords = function (record) {
        var locationStr = { latitude: record.ValgencfMAPPdev__cfMappLatitude__c, longitude: record.ValgencfMAPPdev__cfMappLongitude__c, country: record.Country };
        $scope.isRelatedState = false;
        DataFactory.destroyAllsObjectGraphics(g_esri.map);
        //$scope.initialMapConfig.primaryInfo.location, true
        plotPrimaryMarkerAndScalebar(locationStr, true);
        for (var item of $scope.initialMapConfig.sObjectsMetadata) {
            $('.objectListContainer').removeClass('active');
            $('#tab-' + item.name).removeClass('active');
            $('.header-' + item.name).css('visibility', 'hidden');
            $(".esriSimpleSliderBR").css("bottom", "75px");
            hideBottomPanel();
            delete $scope.sObjectDataTables[item.name];
            if (item.isObjectSelected) {
                var deferred = $q.defer();
                var metadata = $scope.populatesObjectMetadata(item.name);
                $scope.fetchsObjectMarkerDataFromServer(deferred, metadata, item.name, locationStr, false, true);
            }
        };
    }
    // V2.0.CF-T244 end

    // V2.0.CF-T244 start
    $scope.getRelatedRecords = function (deferred, recordId, record, sObjectName) {
        var locationStr = {
            latitude: record.latitude,
            longitude: record.longitude,
            country: record.Country
        };
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getRelatedRecord',
            params: [sObjectName, $scope.initialMapConfig.adminSettingRecId, recordId, JSON.stringify($scope.relatedRecordsConditions[sObjectName]), JSON.stringify(locationStr)],
        };
        fetchDataFromServer(options,
            function (result) {
                if (result.rows && result.rows.length > 0) {
                    Object.keys($scope.sObjectDataTables).forEach(function (key) {
                        $('.objectListContainer').removeClass('active');
                        $('#tab-' + key).removeClass('active');
                        $('.header-' + key).css('visibility', 'hidden');
                        $(".esriSimpleSliderBR").css("bottom", "75px");
                        hideBottomPanel();
                        if (sObjectName != key) {
                            delete $scope.sObjectDataTables[key];
                        }
                    });
                    $scope.isRelatedState = true;
                    var objectMetadata = $scope.populatesObjectMetadata(result.objectName);
                    $scope.createRelatedRecordsLeftSideBar(recordId);
                    DataFactory.destroyAllsObjectGraphics(g_esri.map);
                    result.rows = mergeRecordAttributes(result.rows);
                    result.rows.sort(function (a, b) {
                        return a.distance - b.distance
                    });
                    var sObjectMarkerData = populateAddtionalData(result.objectName, result);
                    $scope.sObjectDataTables[result.objectName] = sObjectMarkerData;
                    plotPrimaryMarkerForRelatedRecords(locationStr, true, record, sObjectName);
                    var correctActions = [];
                    for (var action of $scope.sObjectDataTables[result.objectName].actions) {
                        if (action.name != 'Related_Records') {
                            correctActions.push(action);
                        }
                    }
                    $scope.sObjectDataTables[result.objectName].actions = correctActions;
                    objectMetadata.isRelated = true;
                    if (sObjectMarkerData && sObjectMarkerData.rows) {
                        angular.forEach(sObjectMarkerData.rows, function (row) {
                            if (row.Id == recordId && row.isMasked == 'true') {
                                try {
                                    // mask location data for the current cursor
                                    var ranges = [{ min: -250, max: -200 }, { min: 200, max: 250 }];

                                    var rand = [];
                                    ranges.forEach(function (e) { rand.push(Math.random() * (e.max - e.min + 1) + e.min) });
                                    var dx = rand[Math.floor(Math.random() * rand.length)].toFixed(8);
                                    var dy = rand[Math.floor(Math.random() * rand.length)].toFixed(8);

                                    var r_earth = 6378000;

                                    primaryMarkerLocation.latitude = row[sObjectMarkerData.latitudeFieldName] + (dy / r_earth) * (180 / Math.PI);
                                    primaryMarkerLocation.longitude = row[sObjectMarkerData.longitudeFieldName] + (dx / r_earth) * (180 / Math.PI) / Math.cos(primaryMarkerLocation.latitude * Math.PI / 180);
                                    primaryMarkerLocation.markerGeometryPoint.x = primaryMarkerLocation.latitude;
                                    primaryMarkerLocation.markerGeometryPoint.x = primaryMarkerLocation.longitude;
                                } catch (err) {
                                    console.log('offset geocoding error');
                                }
                            }
                        });
                    }
                    plotRelatedMarkerOnMap(result.objectName, objectMetadata.iconColor, sObjectMarkerData);

                    $timeout(function () {
                        $('#detailPageSidebarScrollerId').mCustomScrollbar({
                            theme: "dark",
                            autoHideScrollbar: true,
                            scrollTo: "top"
                        });
                        // V3.0.PS1-T121 Start
                        $scope.zoomMinus();
                    }, 150);
                    // V3.0.PS1-T121 End
                    // V3.0.CF-I231 START

                    $scope.setTablePageSize(result.objectName, result.pageSize);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                } else {
                    MessageService.showMessageOnMap('Related records not found', 'error');
                }
                deferred.resolve(result);
                // V3.0.CF-I231 END
            },
            function (error) {
                MessageService.showMessageOnMap('Related records not found', 'error');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                deferred.reject(error);
            }
        );
    }
    // V2.0.CF-T244 end

    // V2.0.CF-T244 start
    $scope.populatesObjectMetadata = function (type) {
        var res = {};
        for (var item of $scope.initialMapConfig.sObjectsMetadata) {
            if (item.name == type) {
                res = item;
                continue;
            }
        }
        return res;
    }
    // V2.0.CF-T244 end

    // V2.0.CF-I97 start
    $scope.zoomPlus = function () {
        var val = g_esri.map.__LOD.level;
        g_esri.map.setZoom(val + 1);
    }

    $scope.zoomMinus = function () {
        var val = g_esri.map.__LOD.level;
        g_esri.map.setZoom(val - 1);
    }
    // V2.0.CF-I97 end

    // V3.0.PS1-T121 Start
    zoomValue = function () {
        var val = g_esri.map.__LOD.level;
        g_esri.map.setZoom(val);
    }
    // V3.0.PS1-T121 End

    // V2.0.CF-T244 start
    $scope.createRelatedRecordsLeftSideBar = function (recordId) {
        $scope.relatedMainRecordId = recordId;
        $scope.leftSideBarRowsCopy = $scope.leftSidebar.records;
        var recordsNew = [];
        for (var i = 0; i < $scope.leftSidebar.records.length; i++) {
            if ($scope.leftSidebar.records[i].Id == recordId) {
                recordsNew.push($scope.leftSidebar.records[i]);
            }
        }
        // var path = $scope.imagePath['Related_Records'];
        // $scope.leftSidebar.detailPage.action.rows.push({name: 'Related_Records', label: 'Related Records', imgPath: path});
        $scope.leftSidebar.records = recordsNew;
    }
    // V2.0.CF-T244 end

    // V2.0.CF-T244 start
    $scope.bottomTableFilter = function (item) {
        if ($scope.isRelatedState) {
            if (item.isRelated) {
                return item;
            }
        } else {
            if (item.isObjectSelected) {
                return item;
            }
        }
    };
    // V2.0.CF-T244 end

    $scope.highlightMarkerOnMap = function (recordId, sObjectName, event) {
        // V2.0.CF-I24 start
        var sObjectData = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata, sObjectName, 'name');

        //console.log("highlightMarkerOnMap");

        hideHighlitedBottomListRow();

        resetAllMarkers();
        var graphicsLayer = DataFactory.getsObjectGraphicsByObject(sObjectName);
        if (graphicsLayer) {
            var markerGraphic;
            for (i = 0; i < graphicsLayer.length; i++) {
                if (graphicsLayer[i].attributes.record.Id == recordId) {
                    markerGraphic = graphicsLayer[i];
                    break;
                }
            }
            markerGraphic = markerGraphic || g_esri.map.getLayer($scope.primaryLocationLayerId).graphics[0];
            hideInfoWindow();
            showInfoWindow(markerGraphic);
            g_esri.map.centerAt(markerGraphic.geometry);
        }
        $(event.target).closest("tr").css('outline', '2px solid ' + sObjectData.iconColor);
        // V2.0.CF-I24 end
    }

    function showInfoWindow(markerGraphic, coords) {
        delete g_esri.map.infoWindow.features;
        g_esri.map.infoWindow.setContent(markerGraphic.getContent());
        g_esri.map.infoWindow.setTitle(markerGraphic.getTitle());
        g_esri.map.infoWindow.on('hide', function () {
            hideHighlitedBottomListRow();
        })
        g_esri.map.infoWindow.show(coords || markerGraphic.geometry, g_esri.map.getInfoWindowAnchor(markerGraphic.screenPoint));
    }

    function hideInfoWindow() {
        g_esri.map.infoWindow.hide();
    }

    $scope.setTablePageSize = function (sObjectName, pageSize, shouldScale) {
        $scope.sObjectDataTables[sObjectName].pageSize = pageSize;
        g_esri.map.infoWindow.hide();
        $scope.sObjectDataTables[sObjectName].filtered = MapService.getSObjectRecordsBySearchCriteria($scope.sObjectDataTables[sObjectName].rows,
            $scope.sObjectDataTables[sObjectName].searchStr,
            $scope.sObjectDataTables[sObjectName].pageSize);
        onBottomListSearchShowHideMarkers($scope.sObjectDataTables[sObjectName].filtered, sObjectName);
        updateSummary(sObjectName);
        scaleAndCenter(sObjectName, shouldScale);
        console.log("+++ In setTablePageSize +++ " + sObjectName);
        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 450);
    }

    // V2.0.CF-I92 start
    // V2.0.CF-I94 start
    $scope.toggleLeftSidebar = function () {
        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 450);
        if ($('#tab-Lead').is('.active')) {
            $timeout(function () {
                $('#scrollable-area').scrollLeft(0);
            }, 100);
        }
        if ($('#tab-Contact').is('.active')) {
            $timeout(function () {
                $('#scrollable-area').scrollLeft(10);
            }, 100);
            $timeout(function () {
                $('#scrollable-area').scrollLeft(0);
            }, 10);
        }
        $timeout(function () {
            $('#scrollable-area').scrollLeft(0);
        }, 500);
        if ($('#tab-Lead').is('.active') || $('#tab-Contact').is('.active')) {
            $('.additionalBlock_left').css("visibility", 'visible');
        }
        var sideBar = $(".pageContainer ")
        sideBar.toggleClass('hideSidebar');
        var headers = $(".tableFloatingHeaderOriginal");
        if (headers) {
            for (var header of headers) {
                var selector = '.' + header.classList[0];
                var thead = $(selector);
                var currentVal = header.offsetLeft;
                if (!sideBar.hasClass('hideSidebar')) {
                    thead.css("left", currentVal + 400);
                    $('.additionalBlock_left').css("left", 350);
                    if ($('#tab-Lead').is('.active') || $('#tab-Contact').is('.active')) {
                        $('.additionalBlock_left').css("visibility", 'visible');
                    }
                } else {
                    thead.css("left", currentVal - 400);
                    $('.additionalBlock_left').css("left", 0);
                }
            }
        }
        $timeout(function () {
            var tbl = $('#wrapBottomTable');
            tbl.trigger('resize');
        }, 150);
    }
    // V2.0.CF-I92 end
    // V2.0.CF-I94 end

    $scope.closeMessageBoxFromMap = function () {
        $("div#mapToastMsgId h2").html('');
        $("#mapToastMsgId").attr('class', 'toastMsg')
        $("#mapToastMsgId").hide();
    }

    $scope.hideMessageOnDetailPage = MessageService.hideMessageOnDetailPage;

    $scope.onClickOfDetailPageEditBtn = function () {
        $scope.leftSidebar.detailPage.isEdit = true;
    }

    $scope.onClickOfDetailPageEditCancelBtn = function () {
        $scope.leftSidebar.detailPage.isEdit = false;
        $scope.leftSidebar.detailPage['editRecord'] = angular.copy($scope.leftSidebar.detailPage['record']);
    }

    $scope.saveDetailPageRecord = function () {
        //alert('in saveDetail');
        LoadingProcessService.show(G_LOADING_PROCESS_SELECTOR.detailPage);
        var sObjectRecordToInsert = {
            attributes: {
                type: $scope.leftSidebar.detailPage.sObjectName
            }
        };
        var fields = $scope.leftSidebar.detailPage.fields;
        for (var i = 0; tot = fields.length, i < tot; i++) {

            if (fields[i].owner == 'user') {

                sObjectRecordToInsert[fields[i].name] = $scope.leftSidebar.detailPage.editRecord[fields[i].name];
            }
        }

        sObjectRecordToInsert['Id'] = $scope.leftSidebar.detailPage.editRecord['Id'];

        var options = {
            url: 'ValgencfMAPPdev.PVMapController.updateSobjectRecord',
            params: [JSON.stringify(sObjectRecordToInsert)],
        };

        fetchDataFromServer(options,
            function (result) {
                MessageService.hideMessageOnDetailPage();
                //console.log(result);
                for (var key in $scope.leftSidebar.detailPage.editRecord) {
                    if ($scope.leftSidebar.detailPage.editRecord.hasOwnProperty(key)) {
                        $scope.leftSidebar.detailPage.record[key] = $scope.leftSidebar.detailPage.editRecord[key];
                    }
                }
                $scope.leftSidebar.detailPage.isEdit = false;
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
            },

            function (error) {
                //console.log('saveDetailPageRecord error==',error);
                MessageService.showMessageOnDetailPage(error, 'error');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.detailPage);
            }
        );
    }

    //use to swap objects
    $scope.sortableOptions = {
        stop: function (e, ui) {
            var sObjectName = $scope.initialMapConfig.sObjectsMetadata[0].name;
            if ($scope.colorBoxData && $scope.colorBoxData.sObjectName) {
                $scope.closeColorBox();
            }
            if ($scope.leftSidebar.sObjectName != sObjectName) {
                initializeLeftsidebar(sObjectName);
            }
        }
    };

    $scope.backToRecordList = function () {
        adjustLeftPanelListViewHeight();
        $('#LeftSidebar_DetailPage').hide();
        $('#LeftSidebar_ResultList').show();
        $('#detailPageAllRecordsHeaderId').show();
        $('#detailPageBackIconId').hide();
        $('#detailPageBackIconId').removeClass('showBackBtn');
        $('#detailPageToastMsgId').hide();
        $scope.leftSidebar.detailPage = {};
    }

    function initAccesses() {
        var deferred = $q.defer();
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.checkIsDashBoardEnabled',
            params: [],
        };

        fetchDataFromServer(options,
            function (result) {
                $scope.hasAccess = result;
                deferred.resolve(result);
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    }

    function initEsriMap(Map) {
        var map = new Map("map", {
            //basemap: "streets-navigation-vector",
            basemap: "gray-vector",
            showAttribution: false,
            // V2.0.CF-T235 start
            slider: false,
            // V2.0.CF-T235 end
            // V3.0.PS1-T121 Start
            center: [-95.7129, 37.0902], //[-122.45, 37.75]
            zoom: 9,
            minZoom: 1,
            maxZoom: 20,
            // V3.0.PS1-T121 End
            logo: false,
            showLabels: true
        });

        /*console.log("1 => " + getEsriMapHeight());*/
        /*
        var mapHeight = getEsriMapHeight();
        $('#map').height(mapHeight);
        $('.sidebarInner').height(mapHeight - 180);
        */
        $('#map').height(0);

        map.on("load", onMapLoad);
        checkIsLightning();
        map.infoWindow.on('hide', function (event) {
            if (event.target.features && event.target.features.length > 0) {
                event.target.features[0].setSymbol(event.target.features[0].attributes.originalSymbol);
            }

            /*
            hideHighlitedBottomListRow();
            $scope.backToRecordList();
            */
        })
        return map;
    }

    function initEsriSearch(map, Search) {
        var search = new Search({
            map: map,
            sources: []
        }, "search");

        search.startup();
        search.on("load", onEsriSearchLoad(search));
        search.on("select-result", onErsiSearchSelectItem);
        return search;
    }

    // V2.0.CF-T222 Start
    function initDrawToolbar(map, Draw) {
        toolbar = new Draw(map);
        toolbar.on("draw-end", addGraphic);
        return toolbar;
    }

    function initEditToolbar(map, Edit) {
        editTB = new Edit(map);
        return editTB;
    }
    // V2.0.CF-T222 End

    function checkIsLightning() {
        $scope.isLightning = (typeof sforce != 'undefined') && sforce && (!!sforce.one);
    }

    // V2.0.CF-T236 Start
    function initNavToolbar(map, Navigation) {
        navTB = new Navigation(map);
        return navTB;
    }

    function extentHistoryChangeHandler() {
        if (dojo.byId('zoom_previous')) {
            dojo.byId('zoom_previous').disabled = g_esri.navToolbar.isFirstExtent();
        }
        g_esri.navToolbar.deactivate();
    }
    // V2.0.CF-T236 End

    //V2.0.CF-T222 Start
    function addGraphic(evt) {
        GrGeofencingLayer.clear();
        var symbol;
        g_esri.drawToolbar.deactivate();
        g_esri.map.showZoomSlider();
        switch (evt.geometry.type) {
            case "point":
            case "multipoint":
                symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                        new esri.Color([255, 0, 0]), 1),
                    new esri.Color([0, 255, 0, 0.25]));
                break;
            case "polyline":
                symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH,
                    new esri.Color([255, 0, 0]), 3);
                break;
            default:
                symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                        new esri.Color([255, 255, 0]), 2),
                    new esri.Color([0, 0, 255, 0.25]));
                break;
        }
        console.log(symbol + " " + evt.geometry);

        /*
        // V2.0.CF-I86 start
        $scope.selectedLeads = [];
        $scope.selectedContacts = [];
        // V2.0.CF-I86 end
        */
        var newGraphic = new esri.Graphic(evt.geometry, symbol);
        GrGeofencingLayer.add(newGraphic);

        dojo.connect(GrGeofencingLayer, "onClick", function (evt) {
            showLayerWindow(evt.mapPoint);
        });

        findPointsInExtent(evt.geometry);
    }
    // V2.0.CF-T222 End

    function showLayerWindow(coords) {
        delete g_esri.map.infoWindow.features;
        g_esri.map.infoWindow.setContent('<div class="resultList">' + '<ul><li>' + '<a class="popup__title"> Mass Select Options</a>' + '</li></ul>' + '<ul class="popup__action-list slds-grid">' + '<li class="slds-size_1-of-6 slds-text-align_center" title="Add To Campaign" id="layerClickPopUp"><svg aria-hidden="true" class="popup__action-image "><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/utility-sprite/svg/symbols.svg#campaign" ></use></svg></li>' + '<li class="slds-size_1-of-6 slds-text-align_center" title="Change Lead Owner" id="changeleadowner"><svg aria-hidden="true" class="popup__action-image "><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/utility-sprite/svg/symbols.svg#change_owner" ></use></svg></li>' + '</ul>' + '</div>');
        //g_esri.map.infoWindow.setTitle('<p>Test</p>')
        // g_esri.map.infoWindow.setContent('<svg class="slds-button__icon slds-icon_small" aria-hidden="true"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/apexpages/slds/latest/assets/icons/utility-sprite/svg/symbols.svg#campaign"></use></svg>');
        g_esri.map.infoWindow.show(coords);
        $('#layerClickPopUp').bind('click', function () {
            $scope.openExportWindow(false);
            g_esri.map.infoWindow.hide();
        });
        $('#changeleadowner').bind('click', function () {
            // $("#lead_owner_assignment").show();
            // $("#lead_selection").addClass('active');
            // $("#lead_selection").show();
            //
            // $("#lead-owner-change-action-btns .cancel-btn").show();
            // $("#lead-owner-change-action-btns .finish-btn").show();
            // $("#lead-owner-change-action-btns .close-btn").hide();
            // //createLeadTableForSelectedShape();
            $scope.openExportWindowLead(false);
            g_esri.map.infoWindow.hide();
            // $(".export_panel_header").focus();
            // g_esri.map.infoWindow.hide();
        });
    }

    // V2.0.CF-I86 start
    // change lead owner ends
    function findPointsInExtent(evt) {
        $scope.selectedLeads = [];
        $scope.selectedContacts = [];
        var graphicsLayerLead = g_esri.map.getLayer("Lead");
        var graphicsLayerContact = g_esri.map.getLayer("Contact");
        var leadsSet = new Set();
        var contactsSet = new Set();
        if (graphicsLayerLead) {
            dojo.forEach(graphicsLayerLead.graphics, function (graphic) {
                if (evt.contains(graphic.geometry)) {
                    highlightMarker(graphic);
                    leadsSet.add(graphic.attributes.record);
                }
                $scope.selectedLeads = Array.from(leadsSet);
            });
        }
        if (graphicsLayerContact) {
            dojo.forEach(graphicsLayerContact.graphics, function (graphic) {
                if (evt.contains(graphic.geometry)) {
                    highlightMarker(graphic);
                    contactsSet.add(graphic.attributes.record);
                }
            });
            $scope.selectedContacts = Array.from(contactsSet);
        }
    }
    // V2.0.CF-I86 end

    $scope.GrGeofencing = function ($event) {
        // V2.0.CF-T235 start
        if ($event.currentTarget.id == 'circle') {
            $scope.currentAction = $scope.imagePath.circle;
        } else if ($event.currentTarget.id == 'rectangle') {
            $scope.currentAction = $scope.imagePath.rectangle;
        } else {
            $scope.currentAction = $scope.imagePath.poligon;
        }
        // V2.0.CF-T235 end
        clearGraphics();
        var tool = $event.target.id.toUpperCase();
        g_esri.drawToolbar.activate(esri.toolbars.Draw[tool]);
    }
    // V2.0.CF-T222 End

    // V2.0.CF-T236 Start
    $scope.ZoomExtent = function () {
        g_esri.navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
    }

    $scope.ZoomPrevious = function () {
        g_esri.navToolbar.zoomToPrevExtent();
    }
    // V2.0.CF-T236 End

    // Start CF-I81
    function clearGraphics() {
        g_esri.map.graphics.clear();
        GrGeofencingLayer.clear();
    }

    /*Clear Geofencing*/
    $scope.ClearGeofencing = function () {
        g_esri.drawToolbar.deactivate();
        $scope.selectedLeads = [];
        $scope.selectedContacts = [];
        clearGraphics();
        resetAllMarkers();
    }
    // End CF-I81

    function onErsiSearchSelectItem(e) {
        g_esri.map.infoWindow.hide();
        clearGraphics();
        clearMap();

        var point = e.result.feature.attributes;

        var searchPointLocation = new Object();
        searchPointLocation["locationFound"] = false;
        searchPointLocation["found"] = true;
        searchPointLocation["latitude"] = point.Y;
        searchPointLocation["longitude"] = point.X;
        //searchPointLocation["address"] = point.Match_addr;
        searchPointLocation["address"] = g_esri.search.value;
        searchPointLocation["country"] = point.Country;

        /* shows primary marker on the map */
        plotPrimaryMarkerAndScalebar(searchPointLocation, false);

        /* show basic objects on the map */
        $scope.initialMapConfig.primaryInfo = {};
        displayInitObjectOnMap(true);
    }

    /* old code */
    window.makeSearchedLocationAsPrimaryMarker = function (latitude, longitude, address, country) {

        //console.log('makeSearchedLocationToPrimaryMarker==/');
        g_esri.map.infoWindow.hide();
        g_esri.map.graphics.clear();
        clearMap();

        var location = new Object();
        location["latitude"] = latitude;
        location["longitude"] = longitude;
        location["address"] = address;
        location["country"] = country;
        //getAddressFromLocation(latitude,longitude);

        plotPrimaryMarkerAndScalebar(location, false);

        return false;
    }

    function initEsriScalebar(map, scaleUnit) {
        console.log(scaleUnit);
        var scalebar = new esri.dijit.Scalebar({
            map: map,
            // "dual" displays both miles and kilometers
            // "english" is the default, which displays miles
            // use "metric" for kilometers
            scalebarUnit: scaleUnit,
            /* CF-I44 start */
            // scalebarStyle:"ruler"
            /* CF-I44 end */
        }, dojo.byId("map-scalebar"));
        return scalebar;
    }

    function resetEsriMapScalebar(metricSystem) {
        var newScalebarUnit;
        console.log(metricSystem);

        /* CF-I16 start */
        switch (metricSystem) {
            case 'imperial':
                newScalebarUnit = 'english';
                break;
            case 'metric':
                newScalebarUnit = 'metric';
                break;
            default:
                newScalebarUnit = 'english';
        }
        /* CF-I16 end */

        console.log(newScalebarUnit);
        console.log(metricSystem);

        if (g_esri.scalebar.scalebarUnit != newScalebarUnit) {
            //console.log('change scalebar unit');
            g_esri.scalebar.destroy();
            g_esri.scalebar = initEsriScalebar(g_esri.map, newScalebarUnit);
        }
    }

    // Load initial prospervue configuration after map load.
    function onMapLoad() {
        loadInitialMapConfig()
            .then(showPrimaryLocation)
            .then(loadDashboardComponent);
        $("#ColorBoxId").draggable({
            handle: ".colorPinContainerHeader"
        });
        $('.togglerContainer').mCustomScrollbar({
            theme: "dark",
            autoHideScrollbar: true,
            axis: "x",
            advanced: {
                updateOnSelectorChange: '.object-tabs__item'
            }
        });
    }

    // V3.0.PS1-T130, V3.0.PS1-T72, V3.0.PS1-T123 Start
    createVectorTileLayer = function (VectorTileLayer) {
        var customLightGrayStyleURL = "https://valgen.maps.arcgis.com/sharing/rest/content/items/c0cab3b9b12e46b8978332aa26ecedf5/resources/styles/root.json?f=pjson";
        var vectorMap = new VectorTileLayer("https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer", {
            id: "customLightGrayStyleURL",
            visible: false
        });
        vectorMap.setStyle(customLightGrayStyleURL);
        g_esri.map.addLayer(vectorMap);
    }

    $scope.ShowHideDropDown = function () {
        $scope.IsVisible = $scope.IsVisible ? false : true;
        if ($scope.IsVisible) {
            g_esri.map.getLayer("layer0").setVisibility(false);
            g_esri.map.getLayer("customLightGrayStyleURL").setVisibility(true)
            $scope.sObjectGroupDataTable = $scope.sObjectDataTables;
            $scope.isRelatedState = true;
            DataFactory.destroyAllsObjectGraphics(g_esri.map);
            $scope.toggleLeftSidebar()
        } else {
            removeLayers();
            g_esri.map.getLayer("customLightGrayStyleURL").setVisibility(false)
            g_esri.map.getLayer("layer0").setVisibility(true);
            $scope.isRelatedState = false;
            $scope.returnToMainRecords(LocationFactory.getPrimaryLocationGraphic().attributes.record);
            //var graphic = g_esri.map.getLayer("primary-location").graphics[0];
            //$scope.showDetailPage(graphic.attributes.record, graphic.attributes.sObjectName, graphic.attributes.sObjectData);
            $scope.toggleLeftSidebar()
        }
    }

    $scope.getFieldList = function () {
        delete $scope.sObjectField;
        if ($scope.sObjectG) {
            var allFields = $scope.sObjectG.sObjectFields;
            var numericalFields = [];
            for (var i = 0; i < allFields.length; i++) {
                if (allFields[i].type == "INTEGER" || allFields[i].type == "CURRENCY") {
                    if (allFields[i].label != "Distance")
                        numericalFields.push(allFields[i]);
                }
            }
            $scope.sObjectFieldList = numericalFields;
            if (!g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName)) {
                getGroupRecords($scope.sObjectG, $scope.sObjectFieldList);
                setVisibility();
            } else {
                setVisibility();
            }
        }
    }

    setVisibility = function () {
        Object.keys($scope.sObjectGroupDataTable).forEach(function (key) {
            if ($scope.sObjectG.objectName != key && g_esri.map.getLayer($("#selectedLayer").val() + "_" + key)) {
                console.log(key);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + key).setVisibility(false);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + key).setRenderer(getRenderer());
            } else {
                if (g_esri.map.getLayer($("#selectedLayer").val() + "_" + key)) {
                    g_esri.map.getLayer($("#selectedLayer").val() + "_" + key).setVisibility(true);
                    g_esri.map.getLayer($("#selectedLayer").val() + "_" + key).setRenderer(getRenderer());
                }
            }
        });
    }

    removeLayers = function () {
        Object.keys(layerURLs).forEach(function (layerName) {
            Object.keys($scope.sObjectGroupDataTable).forEach(function (objectName) {
                if (g_esri.map.getLayer(layerName + "_" + objectName)) {
                    g_esri.map.removeLayer(g_esri.map.getLayer(layerName + "_" + objectName));
                }
            });
        });
    }

        //var layerURLs = { "stateLayer": "https://services2.arcgis.com/JoecHEvChY6qFe2m/arcgis/rest/services/USA_States/FeatureServer/0", "USCountyLayer": "https://services2.arcgis.com/JoecHEvChY6qFe2m/arcgis/rest/services/USA_Counties/FeatureServer/0", "telephoneAreaCodeLayer": "https://services2.arcgis.com/JoecHEvChY6qFe2m/arcgis/rest/services/USA_Telephone_Area_Codes/FeatureServer/0", "countryLayer": "https://services2.arcgis.com/JoecHEvChY6qFe2m/arcgis/rest/services/World_Countries/FeatureServer/0" };
    var layerURLs = { "stateLayer": "https://services2.arcgis.com/JoecHEvChY6qFe2m/arcgis/rest/services/USA_States/FeatureServer/0" };

    var geomdata, featureCollection, sfs, geomParams;

    async function loadBoundaryLayers(rowData, fieldList) {
        var labelColor = new esri.Color("#666");
        var layerLabel = new esri.symbol.TextSymbol().setColor(labelColor);
        layerLabel.font.setSize("10pt");
        layerLabel.font.setFamily("arial");
        var labelJSON = {
            "labelExpressionInfo": { "value": "{name}" }
        };
        sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
                new esri.Color([255, 0, 0]), 2), new esri.Color([255, 255, 0, 0.25]));
        geomParams = {
            where: "1=1",
            outFields: "*",
            returnGeometry: true,
            f: "json"
        };
        Object.keys(layerURLs).forEach(function (key) {
            var data2;
            $.ajax({
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp',
                data: geomParams,
                url: layerURLs[key] + "/query/",
                success: function (data2) {
                    if (data2.spatialReference.wkid != 4326) {
                        data2.features.forEach(function (feature) {
                            feature.geometry = new esri.geometry.webMercatorToGeographic(new esri.geometry.Polygon(feature.geometry.rings));
                        });
                    }
                    geomdata = checkInside(data2, rowData.rows, rowData.objectName, fieldList);

                    featureCollection = {
                        layerDefinition: {
                            geometryType: geomdata.geometryType,
                            spatialReference: new esri.SpatialReference({
                                wkid: 4326
                            }),
                            objectIdField: geomdata.objectIdFieldName,
                            fields: geomdata.fields,
                            drawingInfo: {
                                renderer: {
                                    type: "simple",
                                    symbol: sfs
                                }
                            }
                        },
                        featureSet: {
                            features: geomdata.features,
                            geometryType: geomdata.geometryType,
                            spatialReference: new esri.SpatialReference({
                                wkid: 4326
                            })
                        }
                    };
                    var infoTemplate = new esri.InfoTemplate("", generateTemplateForInfoWindow);
                    var featureLayer = new esri.layers.FeatureLayer(featureCollection, {
                        id: key + "_" + $scope.sObjectG.objectName,
                        opacity: 1.0,
                        visible: updateVisibility(key),
                        infoTemplate: infoTemplate
                    });
                    featureLayer.setRenderer(getRenderer());
                    var labelClass = new esri.layers.LabelClass(labelJSON);
                    labelClass.symbol = layerLabel;
                    featureLayer.setLabelingInfo([labelClass]);
                    featureLayer.on("click", onBoundaryClick);
                    featureLayer.on("mouse-over", onBoundaryHover);
                    featureLayer.on("mouse-out", hideInfoWindow);
                    g_esri.map.addLayer(featureLayer);
                    g_esri.map.reorderLayer(featureLayer, 0);
                    featureLayer.newExtent = getNewExtent(featureLayer.id);
                }
            });
        });
    }

    getGroupRecords = function (sObjectG, sObjectFieldList) {
        var primaryMarkerLocationGraphic = LocationFactory.getPrimaryLocationGraphic();
        var recordId = primaryMarkerLocationGraphic.attributes.record.Id;
        var record = primaryMarkerLocationGraphic.attributes.record;
        var sObjectName = primaryMarkerLocationGraphic.attributes.sObjectName;
        var locationStr = {
            latitude: record.latitude,
            longitude: record.longitude,
            country: record.Country
        };

        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getRelatedRecord',
            params: [sObjectName, $scope.initialMapConfig.adminSettingRecId, recordId, JSON.stringify($scope.relatedRecordsConditions[sObjectName]), JSON.stringify(locationStr)],
        };

        var sObjectsMetadata = $scope.initialMapConfig.sObjectsMetadata

        for (var i = 0; i < sObjectsMetadata.length; i++) {
            if (sObjectName == sObjectsMetadata[i].label)
                removeDataFromLeftPanel(sObjectName, sObjectsMetadata[i].pluralLabel);
        }

        loadBoundaryLayers(sObjectG, sObjectFieldList);

        /*fetchDataFromServer(options,
            function(result) {
                if (result.rows && result.rows.length > 0) {
                    var objectMetadata = $scope.populatesObjectMetadata(result.objectName);
                    result.rows = mergeRecordAttributes(result.rows);
                    result.rows.sort(function(a, b) {
                        return a.distance - b.distance
                    });
                    var sObjectMarkerData = populateAddtionalData(result.objectName, result);
                    $scope.sObjectDataTables[result.objectName] = sObjectMarkerData;
                    // Group values and color code boundary
                    //loadBoundaryLayers(sObjectMarkerData.rows);
                    loadBoundaryLayers(sObjectG.rows);
                } else {
                    MessageService.showMessageOnMap('Related records not found', 'error');
                }
            }
        );*/
        adjustLeftPanelListViewHeight();
    }

    selectedLayer = function (selected) {
        console.log(selected);
        switch (selected) {
            case "country_layer":
                //g_esri.map.getLayer("telephone_area_code_layer").setVisibility(false);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).setVisibility(false);
                //g_esri.map.getLayer("country_layer").setVisibility(true);
                break;
            case "state_layer":
                //g_esri.map.getLayer("telephone_area_code_layer").setVisibility(false);
                //g_esri.map.getLayer("country_layer").setVisibility(false);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).setVisibility(true);
                //g_esri.map.setExtent(g_esri.map.getLayer("state_layer").newExtent);
                break;
            case "telephone_area_code_layer":
                //g_esri.map.getLayer("country_layer").setVisibility(false);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).setVisibility(false);
                //g_esri.map.getLayer("telephone_area_code_layer").setVisibility(true);
                break;
            case "none":
                //g_esri.map.getLayer("country_layer").setVisibility(false);
                g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).setVisibility(false);
                //g_esri.map.getLayer("telephone_area_code_layer").setVisibility(false);
                break;
        }
    }

    $scope.updateField = function (selected) {
        if (selected) {
            g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).setRenderer(getRenderer());
            g_esri.map.getLayer($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName).redraw();
        }
    }

    function updateVisibility(key) {
        if ($("#selectedLayer").val() != key) {
            return false;
        }
        return true;
    }

    function checkInside(geometryData, data, objectName, fieldList) {
        console.log("Number of Features: " + geometryData.features.length + '\n' + "Number of Records: " + data.length + '\n' + "Number of Fields: " + fieldList.length);
        for (var i = 0; i < geometryData.features.length; i++) {
            var dyVariables = {};
            var infoDetails = {};
            var count = 0;
            geometryData.features[i].attributes.infoDetails = infoDetails;
            for (var l = 0; l < fieldList.length; l++) {
                dyVariables[fieldList[l].name] = 0
            }
            for (var j = 0; j < data.length; j++) {
                if (new esri.geometry.Polygon(geometryData.features[i].geometry.rings).contains(new esri.geometry.Point(data[j].longitude, data[j].latitude), new esri.SpatialReference({
                    wkid: 4326
                }))) {
                    count += 1;
                    for (var k = 0; k < fieldList.length; k++) {
                        if (data[j].hasOwnProperty(fieldList[k].name)) {
                            dyVariables[fieldList[k].name] += data[j][fieldList[k].name]
                        } else {
                            dyVariables[fieldList[k].name] += 0
                        }
                    }
                }
            }
            for (var m = 0; m < fieldList.length; m++) {
                var name = fieldList[m].name
                geometryData.features[i].attributes[name] = dyVariables[name];
                geometryData.features[i].attributes.infoDetails[name] = dyVariables[name];
            }
            geometryData.features[i].attributes.infoDetails["Number of " + objectName] = count;
        }
        return geometryData;
    }

    function generateTemplateForInfoWindow(graphic) {
        var html = '<div class="resultList">' + '<ul>';
        html = html + '<li>' + '<a "target="_blank" class="popup__title">' + graphic.attributes.name + '</a> ';

        Object.entries(graphic.attributes.infoDetails).forEach(function (key) {
            html = html + ' <div class="txt-sm">  ' + ' <span class="titleTxt">' + key[0] + ': </span>' + key[1] + ' </div>';
        });

        html = html + '	</li> </ul>';
        html = html + '</div> ';
        return html;
    }

    function getBreaks(sLayer, sAttribute) {
        var sLayerGraphics = g_esri.map.getLayer(sLayer).graphics
        var breaksList = [];
        for (var i = 0; i < sLayerGraphics.length; i++) {
            if (sAttribute in sLayerGraphics[i].attributes) {
                breaksList.push(sLayerGraphics[i].attributes[sAttribute]);
            }
        }
        return breaksList;
    }

    function getRenderer() {
        var symbol = new esri.symbol.SimpleFillSymbol();
        symbol.setColor(new esri.Color([46, 121, 242, 0.7]));

        var renderer = new esri.renderer.ClassBreaksRenderer(symbol, $scope.sObjectField);
        var breaksList
        if ($scope.sObjectField && $scope.sObjectField != "none") {
            breaksList = getBreaks($("#selectedLayer").val() + "_" + $scope.sObjectG.objectName, $scope.sObjectField);

            var series = new geostats(breaksList);
            series.setPrecision(2);
            var a = series.getClassQuantile(5);
            var ranges = series.ranges;
            series.doCount();
            var counter = series.counter;

            console.log("Ranges: " + ranges);
            console.log("Count for range: " + counter);

            //var colors_VU = ['#7cfc00', '#ffff00', '#bebe00', '#006400', '#ff0000', '#ff4500', '#800000', '#FE2712', '#FD5308', '#FB9902', '#C60090', '#FE2712'];
            // Pastel colors
            var colors_VU = ['#FFE981', '#8BF18B', '#83B2FF', '#9B6EF3', '#FF555E', '#FF8650', '#091F93', '#FE2712', '#FD5308', '#FB9902', '#C60090'];

            for (var i = 0; i < ranges.length; i++) {
                var a = ranges[i].split('-');
                var a1 = parseFloat(a[0].trim());
                var a2 = parseFloat(a[1].trim());
                renderer.addBreak(a1, a2, new esri.symbol.SimpleFillSymbol().setColor(new esri.Color.fromHex(switchColors())));
            }
        }
        return renderer;
    }

    function switchColors() {
        var r, g, b, rg, gb, rb;
        var range = 255;
        var sep = range / 4; // controls the minimum separation for saturation
        //note- keep sep < range/3 otherwise may crash browser due to performance
        //reduce the sep if you do not mind pastel colors
        //generate r,g,b, values as long as any difference is < separation
        do {
            r = Math.floor(Math.random() * range);
            g = Math.floor(Math.random() * range);
            b = Math.floor(Math.random() * range);

            rg = Math.abs(r - g);
            gb = Math.abs(g - b);
            rb = Math.abs(r - b);
        } while (rg < sep || gb < sep || rb < sep);

        function rgbtohex(rgb) {
            var first, second;
            first = Math.floor(rgb / 16);
            second = rgb % 16;
            first = first.toString(16);
            second = second.toString(16);
            var rgbtohex = first + second;
            return rgbtohex;
        }

        var r_str = rgbtohex(r),
            g_str = rgbtohex(g),
            b_str = rgbtohex(b);
        var final = '#' + r_str + g_str + b_str;

        return final;
    }

    function getNewExtent(sLayerID) {
        var sLayer = g_esri.map.getLayer(sLayerID)
        var sLayerGraphics = sLayer.graphics;
        var newExtent = new esri.geometry.Extent(sLayerGraphics[0].geometry.getExtent());
        for (var i = 0; i < sLayerGraphics.length; i++) {
            var thisExtent = sLayerGraphics[i].geometry.getExtent();
            newExtent = newExtent.union(thisExtent);
        }
        if (sLayer.spatialReference.wkid != 102100) {
            newExtent = esri.geometry.geographicToWebMercator(newExtent)
        }
        return newExtent;
    }

    function onBoundaryClick(evt) {
        var g = evt.graphic;
        g_esri.map.setExtent(g._extent);
    }

    function onBoundaryHover(evt) {
        var g = evt.graphic;
        g_esri.map.infoWindow.setContent(g.getContent());
        g_esri.map.infoWindow.show(evt.screenPoint, g_esri.map.getInfoWindowAnchor(evt.screenPoint));
    }
    // V3.0.PS1-T130, V3.0.PS1-T72, V3.0.PS1-T123 End

    prosperVueMapApp.plugins = function () {
        return PluginsService;
    }

    function onEsriSearchLoad(search) {
        var sources = search.sources;
        sources.push({
            locator: new esri.tasks.Locator("//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"),
            singleLineFieldName: "SingleLine",
            outFields: ["Addr_type", "Match_addr", "StAddr", "Country", "X", "Y"],
            name: "Esri World Geocoder",
            localSearchOptions: {
                minScale: 300000,
                distance: 50000
            },
            placeholder: "Find address or place",
            //highlightSymbol: new esri.symbol.PictureMarkerSymbol(markerPath.searchedLocation,26,33)
            //highlightSymbol: MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.active.width, $scope.locationMarkerSettings.active.height)
            highlightSymbol: new esri.symbol.SimpleMarkerSymbol(
                esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 180, 238, 0.5]), 8),
                new esri.Color([0, 180, 255, 1.0]))
            //infoTemplate: new esri.InfoTemplate("Search Result", "<a href=javascript:void(0) onClick =\"makeSearchedLocationAsPrimaryMarker(${Y},${X},'${Match_addr}','${Country}')\">Make as primary marker</a></br></br> ${Match_addr}")
        });

        //Set the sources above to the search widget
        search.set("sources", sources);
    }

    function loadInitialMapConfig() {
        var primaryRecordId = MapService.getURLParameterValueByName('primaryId');
        var deferred = $q.defer();
        var options = {
            url: 'ValgencfMAPPdev.PVMapController.getInitialMapConfiguration',
            params: [primaryRecordId],
        };

        fetchDataFromServer(options,
            function (result) {
                //console.log('loadInitialMapConfig=='+JSON.stringify(result));
                $scope.initialMapConfig = result;
                getTooltipStatuses();
                initializeLeftsidebar();
                //LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                deferred.resolve(result.primaryInfo);
            },
            function (error) {
                $scope.toggleLeftSidebar();
                MessageService.showMessageOnMap(error, 'error');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                alignMapHeight();
                $window.dispatchEvent(new Event("resize")); //fix to remove vertical scroll
                deferred.reject(error);
            }
        );
        return deferred.promise;
    }

    function loadDashboardComponent() {
        var deferred = $q.defer();
        var dashboardId = MapService.getURLParameterValueByName('dashBoardSettingId');
        if (dashboardId) {
            primaryMarkerLocation = LocationFactory.getPrimaryMarkerObjData();
            getDashboardPublishedData(dashboardId, $scope.initialMapConfig.adminSettingRecId, primaryMarkerLocation)
                .then(function (result) { // Auto Load object data.
                    return autoLoadsObjectMarker(result.sObjectName);
                })
                .then(function (result) { // Show dashboard color marker.
                    //alert(result);
                    //console.log($scope.dashboardComponentData);

                    $scope.dashboardComponent = {
                        label: $scope.dashboardComponentData.dashboardComponentName,
                        name: $scope.dashboardComponentData.dashboardComponentName
                    };
                    $scope.publishedSegment = {
                        fieldApi2: $scope.dashboardComponentData.field_2APIName,
                        label: $scope.dashboardComponentData.publishedLabel
                    };

                    generateDashboardColorBoxAndChangeExistingMarkerColor($scope.dashboardComponentData);

                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                    deferred.resolve('success');
                }, function (error) {
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                    deferred.reject(error);
                    //console.log(error);
                })
        } else {
            LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
            deferred.resolve('success');
        }
        return deferred.promise;
    }

    function redrawMarker(id) {
        var graphicsLayer = g_esri.map.getLayer(id);
        if (graphicsLayer) {
            g_esri.map.reorderLayer(graphicsLayer, 999);
        }
    }

    function showPrimaryLocation(primaryInfo) {
        var deferred = $q.defer();
        /* initial map alignment before element loading */
        alignMapHeight();
        //console.log(primaryInfo);

        if (primaryInfo && primaryInfo.recordId) {
            if (primaryInfo.location && primaryInfo.location.latitude && primaryInfo.location.longitude) {
                plotPrimaryMarkerAndScalebar(primaryInfo.location, true);
                autoLoadsObjectMarker(primaryInfo.sObjectName)
                    .then(function (sObjectData) {
                        var record = MapService.SearchArrayByAttribute(sObjectData.rows, primaryInfo.recordId, 'Id');
                        console.log('++++++++++++ SHOWPMLOC');
                        console.dir(record);
                        $scope.showDetailPage(record, primaryInfo.sObjectName, sObjectData);
                    })
                deferred.resolve('success');
            } else {
                MessageService.showMessageOnMap('Lat or Long of primary location missing. Please search primary location manually', 'info');
                LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                deferred.reject('error');
            }
        } else {
            LocationFactory.getCurrentGeoLocation().then(
                function (currentlocation) {
                    var showPimaryMarkerText = true;
                    /* if current location is not set - them use San Francison */
                    if (!currentlocation.found) {
                        showPimaryMarkerText = false;
                        currentlocation.address = 'ProsperVue cannot determine your location. Please enable location tracking.';
                        currentlocation.country = "USA";
                        currentlocation.found = true;
                        currentlocation.latitude = '37.777336';
                        currentlocation.locationFound = false;
                        currentlocation.longitude = '-95.7129';
                    } else {
                        currentlocation.address = 'Your current location';
                    }

                    /* shows primary marker on the map */
                    plotPrimaryMarkerAndScalebar(currentlocation, showPimaryMarkerText);

                    /* show basic objects on the map */
                    displayInitObjectOnMap(false);

                    /* hide app spinner */
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);

                    /* resolve deffer */
                    deferred.resolve('success');
                },
                function (error) {
                    console.log(error);
                    MessageService.showMessageOnMap(error);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                    deferred.reject(error);
                }
            )
        }
        /* alignment of map height after elements loading */
        alignMapHeight();
        return deferred.promise;
    }

    /* display objects on the map when Primary Id is not set */
    function displayInitObjectOnMap(displayInfo) {
        /* check if config object is exist and contains metadata*/
        var isObjectsSet = ($scope.initialMapConfig && $scope.initialMapConfig.sObjectsMetadata.length > 0);
        if (isObjectsSet) {
            var isInitLoad = false;
            /* loop for every object meta-data */
            angular.forEach($scope.initialMapConfig.sObjectsMetadata, function (value, key) {
                autoLoadsObjectMarkerWithoutRelatedObjects(value.name, isInitLoad).then(function () {

                    /* check if should display primary marker info Window */
                    if (displayInfo) {
                        showPrimaryMarkerInfoWindow();
                    }
                })
            });
        }
    }

        function showPrimaryMarkerInfoWindow() {
            var primaryLocationGraphic = LocationFactory.getPrimaryLocationGraphic();
            showInfoWindow(primaryLocationGraphic);
        }

        function alignMapHeight() {
            var mapHeight = getEsriMapHeight();
            $('#map').height(mapHeight);
            alignSidebar();
        }

        function alignSidebar() {
            $('.sidebarInner').height(getEsriMapHeight() - 50);
        }

        // V2.0.CF-T244 start
        function plotPrimaryMarkerForRelatedRecords(location, showMarkerTitle, record, type) {
            /* prepare graphical layer */
            var graphicsLayer = g_esri.map.getLayer($scope.primaryLocationLayerId);
            /* check if graphicsLayer is exist */
            if (!graphicsLayer) {
                /* console.log('found existing graphics'); */
                graphicsLayer = new esri.layers.GraphicsLayer({
                    id: $scope.primaryLocationLayerId
                });
                g_esri.map.addLayer(graphicsLayer);
            }

            /* Clear the layer of old graphics */
            graphicsLayer.clear();

            /* ERROR hanflish: if localtion is not set */
            if (!location.latitude || !location.longitude) {
                MessageService.showMessageOnMap('Unable to plot primary marker, please try again', 'error');
            }

            /* prepare Primary Marker symbol and data */
            primaryIconSymbol = MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.active.width, $scope.locationMarkerSettings.active.height);

            /* push primary marker to the page */
            infoTemplate = new esri.InfoTemplate("", getPrimaryMarkerTemplate(showMarkerTitle, location.address));

            var sObjectData = $scope.sObjectDataTables[type];
            var path = $scope.imagePath['Related_Records'];
            sObjectData.actions.push({ name: 'Related_Records', label: 'Related Records', imgPath: path });
            infoTemplate = new esri.InfoTemplate("", MapMarkerService.generateTemplateForInfoWindow(type,
                sObjectData.sObjectFields,
                record,
                sObjectData.actions,
                sObjectData.addressField,
                sObjectData.parentRelationshipName,
                $scope.isRelatedState));

            var attributes = {
                "sObjectName": type,
                "record": record,
                "sObjectData": sObjectData
            };

            var pt = new esri.geometry.Point(location.longitude, location.latitude);
            var locationPrimaryGraphics = new esri.Graphic(pt, primaryIconSymbol, attributes, infoTemplate);

            locationPrimaryGraphics.setAttributes({
                "originalSymbol": MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.plain.width, $scope.locationMarkerSettings.plain.height)
            });

            /* define graphicsLayer listeners */
            graphicsLayer.add(locationPrimaryGraphics);
            graphicsLayer.on("click", onMarkerClick);
            graphicsLayer.on("mouse-move", onMarkerMouseOver);
            graphicsLayer.on("mouse-out", onMarkerMouseOut);

            /* add prepaged graphic layer to the map */
            g_esri.map.addLayer(graphicsLayer);
            DataFactory.setsObjectGraphics($scope.primaryLocationLayerId, locationPrimaryGraphics);
            // V3.0.PS1-T121 Start
            //g_esri.map.centerAndZoom(pt, 9);
            g_esri.map.centerAt(pt);
            // V3.0.PS1-T121 End
            LocationFactory.setPrimaryMarkerObjData(location, pt);
            LocationFactory.setPrimaryLocationGraphic(locationPrimaryGraphics);
        }

        /* Plot primary marker of given location details. */
        function plotPrimaryMarkerAndScalebar(location, showMarkerTitle) {

            /* prepare graphical layer */
            var graphicsLayer = g_esri.map.getLayer($scope.primaryLocationLayerId);

            /* check if graphicsLayer is exist */
            if (!graphicsLayer) {
                /* console.log('found existing graphics'); */
                graphicsLayer = new esri.layers.GraphicsLayer({
                    id: $scope.primaryLocationLayerId
                });
                g_esri.map.addLayer(graphicsLayer);
            }

            /* Clear the layer of old graphics */
            graphicsLayer.clear();

            /* ERROR hanflish: if localtion is not set */
            if (!location.latitude || !location.longitude) {
                MessageService.showMessageOnMap('Unable to plot primary marker, please try again', 'error');
            }

            var locationPrimaryGraphics;

            if (showMarkerTitle) {
                if (location.locationFound == false) {
                    showMarkerTitle = false;
                    primaryIconSymbol = new esri.symbol.SimpleMarkerSymbol(
                        esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 98, 170, 0.25]), 12),
                        new esri.Color([0, 98, 170, 1.0]))
                    infoTemplate = new esri.InfoTemplate("", getPrimaryMarkerTemplate(showMarkerTitle, location.address));
                    var pt = new esri.geometry.Point(location.longitude, location.latitude);
                    locationPrimaryGraphics = new esri.Graphic(pt, primaryIconSymbol, null, infoTemplate);
                    locationPrimaryGraphics.setAttributes({
                        "originalSymbol": new esri.symbol.SimpleMarkerSymbol(
                            esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 98, 170, 0.25]), 12),
                            new esri.Color([0, 98, 170, 1.0]))
                    });
                    graphicsLayer.add(locationPrimaryGraphics);
                } else {
                    /* prepare Primary Marker symbol and data */
                    primaryIconSymbol = MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.active.width, $scope.locationMarkerSettings.active.height);
                    /* push primary marker to the page */
                    infoTemplate = new esri.InfoTemplate("", getPrimaryMarkerTemplate(showMarkerTitle, location.address));
                    var pt = new esri.geometry.Point(location.longitude, location.latitude);
                    locationPrimaryGraphics = new esri.Graphic(pt, primaryIconSymbol, null, infoTemplate);
                    locationPrimaryGraphics.setAttributes({
                        "originalSymbol": MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.plain.width, $scope.locationMarkerSettings.plain.height)
                    });
                    /* define graphicsLayer listeners */
                    graphicsLayer.add(locationPrimaryGraphics);
                    graphicsLayer.on("click", onMarkerClick);
                    graphicsLayer.on("mouse-move", onMarkerMouseOver);
                    graphicsLayer.on("mouse-out", onMarkerMouseOut);
                }
            } else {
                primaryIconSymbol = new esri.symbol.SimpleMarkerSymbol(
                    esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([170, 62, 66, 0.25]), 12),
                    new esri.Color([170, 62, 66, 1.0]))
                infoTemplate = new esri.InfoTemplate("", getPrimaryMarkerTemplate(showMarkerTitle, location.address));
                var pt = new esri.geometry.Point(location.longitude, location.latitude);
                locationPrimaryGraphics = new esri.Graphic(pt, primaryIconSymbol, null, infoTemplate);
                locationPrimaryGraphics.setAttributes({
                    "originalSymbol": new esri.symbol.SimpleMarkerSymbol(
                        esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([170, 62, 66, 0.25]), 12),
                        new esri.Color([170, 62, 66, 1.0]))
                });
                graphicsLayer.add(locationPrimaryGraphics);
            }

            /* add prepaged graphic layer to the map */
            g_esri.map.addLayer(graphicsLayer);
            DataFactory.setsObjectGraphics($scope.primaryLocationLayerId, locationPrimaryGraphics);
            // V3.0.PS1-T121 Start
            //g_esri.map.centerAndZoom(pt, 9);
            g_esri.map.centerAt(pt);
            // V3.0.PS1-T121 End 

            LocationFactory.setPrimaryMarkerObjData(location, pt);
            LocationFactory.setPrimaryLocationGraphic(locationPrimaryGraphics);
            resetEsriMapScalebar($scope.initialMapConfig.userMetricSystem);
        }

        function getPrimaryMarkerTemplate(showMarkerTitle, locationAddress) {

            /* prepare result variable */
            var infoTemplate;

            /* define default template for Primary Marker title */
            var infoTeamplate_PrimaryMarketMarkup = "<h2 class='slds-text-heading_small slds-p-bottom_xx-small'>Primary Marker</h2>";

            /* check if Marker title should be hide */
            if (!showMarkerTitle) {
                infoTeamplate_PrimaryMarketMarkup = "";
            }

            /* concatenate parts of template */
            infoTemplate = infoTeamplate_PrimaryMarketMarkup + " <div class='slds-p-bottom_small popup__title ersiMapCustomMessageOnMarker'>" + locationAddress + "</div>";

            return infoTemplate;
        }

        function setPrimaryLocationGraphicAttrs(sObjectName, record, sObjectData) {
            LocationFactory.getPrimaryLocationGraphic().setAttributes({
                "sObjectName": sObjectName,
                "record": record,
                "sObjectData": sObjectData,
                "originalSymbol": MapMarkerService.createLocationSymbol($scope.locationMarkerSettings.plain.width, $scope.locationMarkerSettings.plain.height)
            });
        }


        function plotRelatedMarkerOnMap(sObjectName, markerColor, sObjectData) {
            var graphicsLayer = g_esri.map.getLayer(sObjectName);
            if (!graphicsLayer) {
                graphicsLayer = new esri.layers.GraphicsLayer({
                    id: sObjectName
                });
                g_esri.map.addLayer(graphicsLayer);
            }

            // Clear the layer of old graphics
            // graphicsLayer.clear();

            var currentMaxPlottedMarkerDistance = 0;
            var recordIdToGraphicsMap = {};
            console.log('sObjectData.filtered.length');
            console.log(sObjectData);
            for (var i = 0; i < sObjectData.rows.length; i++) {


                var geometryPoint = new esri.geometry.Point(sObjectData.rows[i][sObjectData.longitudeFieldName],
                    sObjectData.rows[i][sObjectData.latitudeFieldName]);
                // V2.0.CF-T244 start
                var infoTemplate = new esri.InfoTemplate("", MapMarkerService.generateTemplateForInfoWindow(sObjectName,
                    sObjectData.sObjectFields,
                    sObjectData.rows[i],
                    sObjectData.actions,
                    sObjectData.addressField,
                    sObjectData.parentRelationshipName,
                    $scope.isRelatedState));
                // V2.0.CF-T244 end

                var markerSymbol = MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(markerColor).toHex(), 32, 2);

                var attributes = {
                    "sObjectName": sObjectName,
                    "record": sObjectData.rows[i],
                    "sObjectData": sObjectData
                };

                var graphic = new esri.Graphic(geometryPoint, markerSymbol, attributes, infoTemplate);
                graphicsLayer.add(graphic);
                recordIdToGraphicsMap[sObjectData.rows[i].Id] = graphic;


                currentMaxPlottedMarkerDistance = (currentMaxPlottedMarkerDistance < sObjectData.rows[i]['distance']) ? sObjectData.rows[i]['distance'] :
                    currentMaxPlottedMarkerDistance;
                //console.log('graph==',graphicsLayer);
            }

            DataFactory.setCurrentMaxPlottedMarkerDistance(currentMaxPlottedMarkerDistance);
            graphicsLayer.on("click", onMarkerClick);
            graphicsLayer.on("mouse-move", onMarkerMouseOver);
            graphicsLayer.on("mouse-out", onMarkerMouseOut);
            g_esri.map.addLayer(graphicsLayer);

            //console.log(g_esri.map);
            DataFactory.setsObjectGraphics(sObjectName, recordIdToGraphicsMap);

            // Adjust Map zoom level only for 1st plotted object.
            var selectedSObjectIconCount = MapService.getSelectedSObjectIconCount($scope.initialMapConfig.sObjectsMetadata);
            console.log('selectedSObjectIconCount==' + selectedSObjectIconCount);

            if (selectedSObjectIconCount => 1) {
                var zoomScale = MapService.getZoomScale(currentMaxPlottedMarkerDistance);
                var primaryMarkerLocation = LocationFactory.getPrimaryMarkerObjData();
                // V3.0.PS1-T121 Start
                //g_esri.map.centerAndZoom(primaryMarkerLocation.markerGeometryPoint, zoomScale);
                g_esri.map.centerAt(primaryMarkerLocation.markerGeometryPoint);
                // V3.0.PS1-T121 End
            }
        }

        //start V3.0.CF-T237 
        function ClusterLayer(map, declare, arrayUtils, Color, connect, SpatialReference, Point, Graphic, SimpleMarkerSymbol, TextSymbol, PopupTemplate, GraphicsLayer) {
            return declare([GraphicsLayer], {
                constructor: function (options) {
                    this._clusterTolerance = options.distance || 50;
                    this._clusterData = options.data || [];
                    this._clusters = [];
                    this._clusterLabelColor = options.labelColor || "#000";
                    // labelOffset can be zero so handle it differently
                    this._clusterLabelOffset = (options.hasOwnProperty("labelOffset")) ? options.labelOffset : -5;
                    // graphics that represent a single point
                    this._singles = []; // populated when a graphic is clicked
                    this._showSingles = options.hasOwnProperty("showSingles") ? options.showSingles : true;
                    // symbol for single graphics
                    var SMS = SimpleMarkerSymbol;
                    this._singleSym = options.singleSymbol || new SMS("circle", 6, null, new Color("#888"));
                    this._singleTemplate = options.singleTemplate || new PopupTemplate({
                        "title": "",
                        "description": "{*}"
                    });
                    this._maxSingles = options.maxSingles || 1000;

                    this._webmap = options.hasOwnProperty("webmap") ? options.webmap : false;

                    this._sr = options.spatialReference || new SpatialReference({
                        "wkid": 102100
                    });

                    this._zoomEnd = null;
                },

                // override esri/layers/GraphicsLayer methods 
                _setMap: function (map, surface) {
                    // calculate and set the initial resolution
                    this._clusterResolution = map.extent.getWidth() / map.width; // probably a bad default...
                    this._clusterGraphics();

                    // connect to onZoomEnd so data is re-clustered when zoom level changes
                    this._zoomEnd = connect.connect(map, "onZoomEnd", this, function () {
                        // update resolution
                        this._clusterResolution = this._map.extent.getWidth() / this._map.width;
                        this.clear();
                        this._clusterGraphics();
                    });

                    // GraphicsLayer will add its own listener here
                    var div = this.inherited(arguments);
                    return div;
                },

                _unsetMap: function () {
                    this.inherited(arguments);
                    connect.disconnect(this._zoomEnd);
                },

                // public ClusterLayer methods
                add: function (p) {
                    // Summary:  The argument is a data point to be added to an existing cluster. If the data point falls within an existing cluster, it is added to that cluster and the cluster's label is updated. If the new point does not fall within an existing cluster, a new cluster is created.
                    // if passed a graphic, use the GraphicsLayer's add method
                    if (p.declaredClass) {
                        this.inherited(arguments);
                        return;
                    }

                    // add the new data to _clusterData so that it's included in clusters
                    // when the map level changes
                    this._clusterData.push(p);
                    var clustered = false;
                    // look for an existing cluster for the new point
                    for (var i = 0; i < this._clusters.length; i++) {
                        var c = this._clusters[i];
                        if (this._clusterTest(p, c)) {
                            // add the point to an existing cluster
                            this._clusterAddPoint(p, c);
                            // update the cluster's geometry
                            this._updateClusterGeometry(c);
                            // update the label
                            this._updateLabel(c);
                            clustered = true;
                            break;
                        }
                    }

                    if (!clustered) {
                        this._clusterCreate(p);
                        p.attributes.clusterCount = 1;
                        this._showCluster(p);
                    }
                },

                clear: function () {
                    // Summary:  Remove all clusters and data points.
                    this.inherited(arguments);
                    this._clusters.length = 0;
                },

                clearSingles: function (singles) {
                    // Summary:  Remove graphics that represent individual data points.
                    var s = singles || this._singles;
                    arrayUtils.forEach(s, function (g) {
                        this.remove(g);
                    }, this);
                    this._singles.length = 0;
                },

                onClick: function (e) {
                    // remove any previously showing single features
                    this.clearSingles(this._singles);

                    // find single graphics that make up the cluster that was clicked would be nice to use filter but performance tanks with large arrays in IE
                    var singles = [];
                    for (var i = 0, il = this._clusterData.length; i < il; i++) {
                        if (e.graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId) {
                            singles.push(this._clusterData[i]);
                        }
                    }
                    if (singles.length > this._maxSingles) {
                        alert("Sorry, that cluster contains more than " + this._maxSingles + " points. Zoom in for more detail.");
                        return;
                    } else {
                        // stop the click from bubbling to the map
                        e.stopPropagation();
                        this._map.infoWindow.show(e.graphic.geometry);
                        this._addSingles(singles);
                    }
                },

                // internal methods 
                _clusterGraphics: function () {
                    // first time through, loop through the points
                    for (var j = 0, jl = this._clusterData.length; j < jl; j++) {
                        // see if the current feature should be added to a cluster
                        var point = this._clusterData[j];
                        var clustered = false;
                        var numClusters = this._clusters.length;
                        for (var i = 0; i < this._clusters.length; i++) {
                            var c = this._clusters[i];
                            if (this._clusterTest(point, c)) {
                                this._clusterAddPoint(point, c);
                                clustered = true;
                                break;
                            }
                        }

                        if (!clustered) {
                            this._clusterCreate(point);
                        }
                    }
                    this._showAllClusters();
                },

                _clusterTest: function (p, cluster) {
                    var distance = (
                        Math.sqrt(
                            Math.pow((cluster.x - p.x), 2) + Math.pow((cluster.y - p.y), 2)
                        ) / this._clusterResolution
                    );
                    //console.log(distance);
                    return (distance <= this._clusterTolerance);
                },

                // points passed to clusterAddPoint should be included in an existing cluster also give the point an attribute called clusterId that corresponds to its cluster
                _clusterAddPoint: function (p, cluster) {
                    // average in the new point to the cluster geometry
                    var count, x, y;
                    count = cluster.attributes.clusterCount;
                    x = (p.x + (cluster.x * count)) / (count + 1);
                    y = (p.y + (cluster.y * count)) / (count + 1);
                    cluster.x = x;
                    cluster.y = y;

                    // build an extent that includes all points in a cluster extents are for debug/testing only...not used by the layer
                    if (p.x < cluster.attributes.extent[0]) {
                        cluster.attributes.extent[0] = p.x;
                    } else if (p.x > cluster.attributes.extent[2]) {
                        cluster.attributes.extent[2] = p.x;
                    }
                    if (p.y < cluster.attributes.extent[1]) {
                        cluster.attributes.extent[1] = p.y;
                    } else if (p.y > cluster.attributes.extent[3]) {
                        cluster.attributes.extent[3] = p.y;
                    }

                    // increment the count
                    cluster.attributes.clusterCount++;
                    // attributes might not exist
                    if (!p.hasOwnProperty("attributes")) {
                        p.attributes = {};
                    }
                    // give the graphic a cluster id
                    p.attributes.clusterId = cluster.attributes.clusterId;
                },

                // point passed to clusterCreate isn't within the clustering distance specified for the layer so create a new cluster for it
                _clusterCreate: function (p) {
                    var clusterId = this._clusters.length + 1;
                    // console.log("cluster create, id is: ", clusterId);
                    // p.attributes might be undefined
                    if (!p.attributes) {
                        p.attributes = {};
                    }
                    p.attributes.clusterId = clusterId;
                    // create the cluster
                    var cluster = {
                        "x": p.x,
                        "y": p.y,
                        "attributes": {
                            "clusterCount": 1,
                            "clusterId": clusterId,
                            "extent": [p.x, p.y, p.x, p.y],
                            "sObjectName": p.attributes.sObjectName,
                            "record": p.attributes.record,
                            "sObjectData": p.attributes.sObjectData
                        },
                        "infoTemplate": p.infoTemplate
                    };
                    this._clusters.push(cluster);
                },

                _showAllClusters: function () {
                    for (var i = 0, il = this._clusters.length; i < il; i++) {
                        var c = this._clusters[i];
                        this._showCluster(c);
                    }
                },

                _showCluster: function (c) {
                    var point = new Point(c.x, c.y, this._sr);
                    this.add(
                        new Graphic(
                            point,
                            null,
                            c.attributes,
                            c.infoTemplate
                        )
                    );
                    // code below is used to not label clusters with a single point
                    if (c.attributes.clusterCount == 1) {
                        return;
                    }

                    // show number of points in the cluster
                    /*var label = new TextSymbol(c.attributes.clusterCount.toString())
                        .setColor(new Color(this._clusterLabelColor))
                        .setOffset(0, this._clusterLabelOffset);*/
                    if (c.attributes.clusterCount >= 99) {
                        if (c.attributes.clusterCount == 99) {
                            var label = new TextSymbol(c.attributes.clusterCount.toString())
                                .setColor(new Color(this._clusterLabelColor))
                                .setOffset(0, this._clusterLabelOffset);
                        } else {
                            var label = new TextSymbol("99+")
                                .setColor(new Color(this._clusterLabelColor))
                                .setOffset(0, this._clusterLabelOffset);
                        }
                    } else {
                        var label = new TextSymbol(c.attributes.clusterCount.toString())
                            .setColor(new Color(this._clusterLabelColor))
                            .setOffset(0, this._clusterLabelOffset);
                    }
                    this.add(
                        new Graphic(
                            point,
                            label,
                            c.attributes
                        )
                    );
                },

                _addSingles: function (singles) {
                    // add single graphics to the map
                    arrayUtils.forEach(singles, function (p) {
                        var g = new Graphic(
                            new Point(p.x, p.y, this._sr),
                            this._singleSym,
                            p.attributes,
                            p.infoTemplate
                        );
                        this._singles.push(g);
                        if (this._showSingles) {
                            this.add(g);
                        }
                    }, this);
                    this._map.infoWindow.setFeatures(this._singles);
                },

                _updateClusterGeometry: function (c) {
                    // find the cluster graphic
                    var cg = arrayUtils.filter(this.graphics, function (g) {
                        return !g.symbol &&
                            g.attributes.clusterId == c.attributes.clusterId;
                    });
                    if (cg.length == 1) {
                        cg[0].geometry.update(c.x, c.y);
                    } else {
                        console.log("didn't find exactly one cluster geometry to update: ", cg);
                    }
                },

                _updateLabel: function (c) {
                    // find the existing label
                    var label = arrayUtils.filter(this.graphics, function (g) {
                        return g.symbol &&
                            g.symbol.declaredClass == "esri.symbol.TextSymbol" &&
                            g.attributes.clusterId == c.attributes.clusterId;
                    });
                    if (label.length == 1) {
                        // console.log("update label...found: ", label);
                        this.remove(label[0]);
                        var newLabel = new TextSymbol(c.attributes.clusterCount)
                            .setColor(new Color(this._clusterLabelColor))
                            .setOffset(0, this._clusterLabelOffset);
                        this.add(
                            new Graphic(
                                new Point(c.x, c.y, this._sr),
                                newLabel,
                                c.attributes
                            )
                        );
                        // console.log("updated the label");
                    } else {
                        console.log("didn't find exactly one label: ", label);
                    }
                },

                // debug only...never called by the layer
                _clusterMeta: function () {
                    // print total number of features
                    console.log("Total:  ", this._clusterData.length);

                    // add up counts and print it
                    var count = 0;
                    arrayUtils.forEach(this._clusters, function (c) {
                        count += c.attributes.clusterCount;
                    });
                    console.log("In clusters:  ", count);
                }
            });
        }

        $scope.ShowClusterLayers = false;

        $scope.ShowHideClusterLayers = function () {
            $scope.ShowClusterLayers = $scope.ShowClusterLayers ? false : true;
            var sObjectNames = Object.keys($scope.sObjectDataTables);
            if ($scope.ShowClusterLayers) {
                toggleAllMarkers('hide');
                for (var i = 0; i < sObjectNames.length; i++) {
                    g_esri.map.getLayer(sObjectNames[i] + "_ClusterLayer").setVisibility(true)
                }
            } else {
                for (var i = 0; i < sObjectNames.length; i++) {
                    g_esri.map.getLayer(sObjectNames[i] + "_ClusterLayer").setVisibility(false)
                }
                toggleAllMarkers('show');
            }
        }

        function plotClusterLayers(sObjectName, markerColor, sObjectData) {
            var graphicsLayer = g_esri.map.getLayer(sObjectName + "_ClusterLayer");
            var wgs = new esri.SpatialReference({
                "wkid": 4326
            });
            var layerData = {};
            layerData.data = new arrayutils.map(sObjectData.rows, function (p) {
                var latlng = new esri.geometry.Point(parseFloat(p.longitude), parseFloat(p.latitude), wgs);
                var webMercator = new esri.geometry.geographicToWebMercator(latlng);
                var attributes = {
                    "sObjectName": sObjectName,
                    "record": p,
                    "sObjectData": sObjectData
                };
                var infoTemplate = new esri.InfoTemplate("", MapMarkerService.generateTemplateForInfoWindow(sObjectName,
                    sObjectData.sObjectFields,
                    p,
                    sObjectData.actions,
                    sObjectData.addressField,
                    sObjectData.parentRelationshipName));

                return {
                    "x": webMercator.x,
                    "y": webMercator.y,
                    "attributes": attributes,
                    "infoTemplate": infoTemplate
                };
            });

            if (!graphicsLayer) {
                graphicsLayer = new g_esri.map.ClusterLayer({
                    "data": layerData.data,
                    "distance": 100,
                    "id": sObjectName + "_ClusterLayer",
                    "labelColor": "#fff",
                    "labelOffset": 1,
                    "singleColor": "#888"
                });
                g_esri.map.addLayer(graphicsLayer);
            }

            graphicsLayer.setRenderer(applyRenderer(markerColor));
            g_esri.map.addLayer(graphicsLayer);
            g_esri.map.getLayer(sObjectName + "_ClusterLayer").setVisibility(false)
        }

        function applyRenderer(markerColor) {
            markerSymbol = MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(markerColor).toHex(), 32, 2);
            var renderer = new esri.renderer.ClassBreaksRenderer(markerSymbol, "clusterCount");

            var size = [32, 40];
            var range = [[2, 9], [10, Infinity]]
            for (i = 0; i < size.length; i++) {
                var mSize = MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(markerColor).toHex(), size[i], 2);
                renderer.addBreak(range[i][0], range[i][1], mSize);
            }
            return renderer;
        }

        function getColor() {
            var r, g, b, rg, gb, rb;
            var range = 255;
            var sep = range / 4;
            do {
                r = Math.floor(Math.random() * range);
                g = Math.floor(Math.random() * range);
                b = Math.floor(Math.random() * range);

                rg = Math.abs(r - g);
                gb = Math.abs(g - b);
                rb = Math.abs(r - b);
            } while (rg < sep || gb < sep || rb < sep);

            var final = r + ',' + g + ',' + b;

            return final;
        }
        //end V3.0.CF-T237

        function plotMarkerOnMap(sObjectName, markerColor, sObjectData) {
            var graphicsLayer = g_esri.map.getLayer(sObjectName);
            if (!graphicsLayer) {
                //console.log('found existing graphics');
                graphicsLayer = new esri.layers.GraphicsLayer({
                    id: sObjectName
                });
                //start V3.0.CF-T237
                plotClusterLayers(sObjectName, markerColor, sObjectData);
                //end V3.0.CF-T237
                g_esri.map.addLayer(graphicsLayer);
            }

            // Clear the layer of old graphics
            // graphicsLayer.clear();

            var currentMaxPlottedMarkerDistance = 0;
            var recordIdToGraphicsMap = {};
            console.log('in plotMarkerOnMap==');
            // V2.0.CF-I36 start
            for (var i = 0; i < sObjectData.rows.length; i++) {
                var geometryPoint = new esri.geometry.Point(sObjectData.rows[i][sObjectData.longitudeFieldName],
                    sObjectData.rows[i][sObjectData.latitudeFieldName]);
                // V2.0.CF-T244 start
                var infoTemplate = new esri.InfoTemplate("", MapMarkerService.generateTemplateForInfoWindow(sObjectName,
                    sObjectData.sObjectFields,
                    sObjectData.rows[i],
                    sObjectData.actions,
                    sObjectData.addressField,
                    sObjectData.parentRelationshipName,
                    $scope.isRelatedState));
                // V2.0.CF-T244 end
                var markerSymbol = MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(markerColor).toHex(), 32, 2);
                //xlink:href="/apexpages/slds/latest/assets/icons/utility-sprite/svg/symbols.svg#campaign"
                var baseURL = './apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#account';
                //var markerSymbol = new esri.symbol.PictureMarkerSymbol(baseURL, 32, 32);

                var attributes = {
                    "sObjectName": sObjectName,
                    "record": sObjectData.rows[i],
                    "sObjectData": sObjectData
                };

                var graphic = new esri.Graphic(geometryPoint, markerSymbol, attributes, infoTemplate);
                graphicsLayer.add(graphic);
                recordIdToGraphicsMap[sObjectData.rows[i].Id] = graphic;

                if (sObjectData.rows[i].Id == $scope.initialMapConfig.primaryInfo.recordId) {
                    LocationFactory.getPrimaryLocationGraphic().setInfoTemplate(infoTemplate);
                    setPrimaryLocationGraphicAttrs(sObjectName, sObjectData.rows[i], sObjectData);
                    graphic.hide();
                    continue;
                }

                currentMaxPlottedMarkerDistance = (currentMaxPlottedMarkerDistance < sObjectData.rows[i]['distance']) ? sObjectData.rows[i]['distance'] : currentMaxPlottedMarkerDistance;
            }
            // V2.0.CF-I36 end

            DataFactory.setCurrentMaxPlottedMarkerDistance(currentMaxPlottedMarkerDistance);
            graphicsLayer.on("click", onMarkerClick);
            graphicsLayer.on("mouse-move", onMarkerMouseOver);
            graphicsLayer.on("mouse-out", onMarkerMouseOut);
            g_esri.map.addLayer(graphicsLayer);

            DataFactory.setsObjectGraphics(sObjectName, recordIdToGraphicsMap);

            // Adjust Map zoom level only for 1st plotted object.
            var selectedSObjectIconCount = MapService.getSelectedSObjectIconCount($scope.initialMapConfig.sObjectsMetadata);
            //console.log('selectedSObjectIconCount==' + selectedSObjectIconCount);

            if (selectedSObjectIconCount >= 1) {
                var zoomScale = MapService.getZoomScale(currentMaxPlottedMarkerDistance);
                var primaryMarkerLocation = LocationFactory.getPrimaryMarkerObjData();
                // V3.0.PS1-T121 Start
                //g_esri.map.centerAndZoom(primaryMarkerLocation.markerGeometryPoint, zoomScale);
                g_esri.map.centerAt(primaryMarkerLocation.markerGeometryPoint);
                // V3.0.PS1-T121 End
            }
        }

        function autoLoadsObjectMarker(sObjectName) {
            console.log("autoLoadsObjectMarker");

            var sObJMetadata = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata, sObjectName, 'name');
            $scope.initialMapConfig.sObjectsMetadata = MapService.changePositionOfAvailableObjecToFirst(sObjectName,
                sObJMetadata,
                $scope.initialMapConfig.sObjectsMetadata);

            var initialLoading = true;
            return $scope.fetchsObjectMarkerData(sObjectName, sObJMetadata, initialLoading);
        }

        function invokeOnSobjectMarkerDeselect(sObjectName, issObjectSelected, isSelectedsObjectOnFirstPosition, sObjectMetadata) {
            sObjectMetadata.isObjectSelected = false;
            DataFactory.deletesObjectGraphicsByObject(sObjectName, g_esri.map);

            // As user has unchecked object, so no need to show records on leftSidebarData.
            if (isSelectedsObjectOnFirstPosition) {

                removeDataFromLeftPanel(sObjectName, sObjectMetadata.pluralLabel);
                if ($scope.colorBoxData && $scope.colorBoxData.sObjectName) {

                    hideAndClearColorboxData();
                }
            }

            if ($scope.initialMapConfig.primaryInfo.sObjectName === sObjectName) {
                DataFactory.deletesObjectGraphicsByObject($scope.primaryLocationLayerId, g_esri.map);
            }

            delete $scope.sObjectDataTables[sObjectName];

            // V2.0.CF-I77 start
            $('#icon-' + sObjectName).toggleClass("selected");
            // V2.0.CF-I77 end

            // Bottom list view: make next object tab as active.
            if ($scope.initialMapConfig.sObjectsMetadata.length > 0 && $(".objectListContainer").hasClass("active")) {

                var newsObjectName;
                for (var i = 0; i < $scope.initialMapConfig.sObjectsMetadata.length; i++) {

                    if ($scope.initialMapConfig.sObjectsMetadata[i].isObjectSelected) {
                        var newsObjectName = $scope.initialMapConfig.sObjectsMetadata[i].name;
                        break;
                    }
                }
                if (newsObjectName) {
                    $('#tab-' + newsObjectName).addClass('active');
                    $('#tabPanel-' + newsObjectName).addClass('active');
                } else {
                    $(".objectListContainer").removeClass("active");
                }
            } else {
                $(".objectListContainer").removeClass("active");
            }

            //$('.togglerContainer').css('width', ($('.object-tabs').width())).mCustomScrollbar('update');

            adjustLeftPanelListViewHeight();
        }

        function autoLoadsObjectMarkerWithoutRelatedObjects(sObjectName, initialLoading) {
            var sObJMetadata = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata, sObjectName, 'name');
            return $scope.fetchsObjectMarkerData(sObjectName, sObJMetadata, initialLoading);
        }

        function populateAddtionalData(sObjectName, sObjectData) {
            sObjectData.actions = MapService.populateActionImage(sObjectData.actions, $scope.imagePath);
            sObjectData.sortType = 'distance';
            sObjectData.sortReverse = false;
            sObjectData.searchStr = '';
            sObjectData.pageSize = '100';
            //sObjectData.filtered =  sObjectData.rows;

            sObjectData.filtered = MapService.getSObjectRecordsBySearchCriteria(sObjectData.rows, sObjectData.searchStr, sObjectData.pageSize);
            // V2.0.CF-I32 start
            updateSummary(sObjectName);
            // V2.0.CF-I32 end

            var header = [{
                label: "Distance",
                name: "distance",
                type: "INTEGER",
                owner: "app"
            },
            {
                label: "Name",
                name: "Name",
                type: "STRING",
                owner: "app"
            }
            ];
            sObjectData.sObjectFields = header.concat(sObjectData.sObjectFields);

            return sObjectData;
        }

        function mergeRecordAttributes(sObjectrows) {
            var newSobjecs = [];
            for (var i = 0; i < sObjectrows.length; i++) {

                var record = sObjectrows[i].rec;
                delete sObjectrows[i].rec;
                //sObjectrows[i] = Object.assign(sObjectrows[i], record);
                newSobjecs[i] = Object.assign(record, sObjectrows[i]);
                //newSobjecs[i] = Object.assign(sObjectrows[i], record);
            }
            return newSobjecs;
        }

        function showDataOnLeftSidebar(sObjectName, sObjectData) {
            $("#leftSidebarMsgId").hide();

            //console.log($scope.initialMapConfig);

            var leftSidebarTemp = {};
            leftSidebarTemp["sObjectName"] = sObjectName;
            leftSidebarTemp["records"] = sObjectData.filtered;
            leftSidebarTemp.sObjectPluralLabel = $scope.initialMapConfig.sObjectsMetadata[0].pluralLabel;
            //leftSidebarTemp.sObjectLabel = $scope.initialMapConfig.sObjectsMetadata[0].

            $scope.leftSidebar = leftSidebarTemp;
            $scope.dashboardSetting = sObjectData.dashboardSetting;

            if (sObjectData.filtered.length == 0) {

                $scope.leftSidebar["message"] = "Records not found";
                $('#leftSidebarMsgId').show();
            }
        }

        function removeDataFromLeftPanel(sObjectName, pluralLabel) {
            $scope.leftSidebar = {
                records: [],
                message: 'Please select first object (' + sObjectName + ') to start viewing records in this panel.',
                sObjectName: sObjectName,
                sObjectPluralLabel: pluralLabel
            };
            $("#LeftSidebar_DetailPage").hide();
            $("#detailPageBackIconId").hide();
            $("#leftSidebarMsgId").show();
            $("#LeftSidebar_ResultList").show();
            $('#detailPageAllRecordsHeaderId').show();
            $scope.dashboardSetting = {};
        }

        function adjustLeftPanelListViewHeight() {
            $('.topSection').slideDown('fast');
            var windowHeight = $(window).height();
            var mapOffset = $('#map').offset().top;
            var mapHeight = windowHeight - mapOffset
            $('.sidebarInner').height(mapHeight - 90);
        }

        function initializeLeftsidebar() {
            $("#LeftSidebar_DetailPage").hide();
            $("#detailPageBackIconId").hide();
            $('#detailPageAllRecordsHeaderId').hide();
            /*temphide $scope.closeDashboardColorBox(); */

            var leftSidebarTemp = {
                records: []
            };
            console.log('========= $scope.initialMapConfig =====');
            console.dir($scope.initialMapConfig);
            if ($scope.initialMapConfig && $scope.initialMapConfig.sObjectsMetadata.length > 0) {
                var sObjectName = $scope.initialMapConfig.sObjectsMetadata[0].name;
                if ($scope.initialMapConfig.sObjectsMetadata[0].isObjectSelected) {

                    $('#leftSidebarMsgId').hide();
                    leftSidebarTemp.sObjectName = sObjectName;
                    leftSidebarTemp.sObjectPluralLabel = $scope.initialMapConfig.sObjectsMetadata[0].pluralLabel;
                    leftSidebarTemp.sObjectColor = $scope.initialMapConfig.sObjectsMetadata[0].iconColor;
                    leftSidebarTemp.records = $scope.sObjectDataTables[sObjectName].filtered;

                    if (leftSidebarTemp.records.length == 0) {

                        leftSidebarTemp.message = 'Records not found.';
                        $('#leftSidebarMsgId').show();
                    }

                    $scope.dashboardSetting = angular.copy($scope.sObjectDataTables[sObjectName].dashboardSetting);
                    $scope.dashboardComponent = {};
                } else {

                    var infoMessage = 'Please select first object (' + $scope.initialMapConfig.sObjectsMetadata[0].pluralLabel + ') to start viewing records in this panel.';
                    leftSidebarTemp = {
                        sObjectName: $scope.initialMapConfig.sObjectsMetadata[0].name,
                        records: [],
                        message: infoMessage,
                        sObjectPluralLabel: $scope.initialMapConfig.sObjectsMetadata[0].pluralLabel,
                        sObjectColor: $scope.initialMapConfig.sObjectsMetadata[0].iconColor
                    };
                    $scope.dashboardSetting = {};
                    $scope.dashboardComponent = {};
                    $("#leftSidebarMsgId").show();
                }
            } else {

                leftSidebarTemp.message = 'Please contact admin to configure objects.';
            }

            $scope.leftSidebar = leftSidebarTemp;
            $scope.backToRecordList();
            $("#LeftSidebar_ResultList").show();
        }


        function getLogo(logoMetaData, record, hasAccessToLogo) {
            var domain;
            var rawImageData;
            if (hasAccessToLogo) {
                $("#logoAndWeatherCompId").addClass("hasLogo");
            } else {
                $("#logoAndWeatherCompId").removeClass("hasLogo");
                return;
            }
            console.log('logoMetaData ====>>>' + logoMetaData);
            console.log(record);
            rawImageData = MapService.getLogo(logoMetaData, record);

            return rawImageData;
        }

        function populateWeatherDetails(record, hasAccessToWeather, prosperVueLatitudeFieldName, prosperVueLongitudeFieldName) {

            var deferred = $q.defer();

            if (hasAccessToWeather)
                $("#sidebar-header").addClass("hasLocationDetails");

            else {
                $("#sidebar-header").removeClass("hasLocationDetails");
                deferred.resolve(null);
            }

            // Fetch Object configuration data
            //console.log(record);
            //console.log(prosperVueLatitudeFieldName);
            //console.log(prosperVueLongitudeFieldName);
            var prosperVueLatitude;
            var prosperVueLongitude;

            if (record != null) {
                prosperVueLatitude = record[prosperVueLatitudeFieldName];
                prosperVueLongitude = record[prosperVueLongitudeFieldName];
            } else {
                prosperVueLatitude = null;
                prosperVueLongitude = null;
            }

            var options = {
                url: 'ValgencfMAPPdev.PVMapController.getWeatherDetails',
                params: [prosperVueLatitude, prosperVueLongitude],
            };

            fetchDataFromServer(options,

                function (result) {
                    //console.log('result==',result);
                    // V3.0_02-04-2019 START
                    if (result) {
                        result.icon = ProsperVue_MapResourcesPath + '/images/weatherIcons/' + MapService.replaceImgExtension(result.icon || '', 'svg');
                    }
                    // V3.0_02-04-2019 END
                    deferred.resolve(result);
                },

                function (error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        }

        function fetchActivityHistory(recordId, recordStartIndex, recordEndIndex) {

            var deferred = $q.defer();

            var options = {
                url: 'ValgencfMAPPdev.PVMapController.getSObjectActivityHistory',
                params: [recordId, recordStartIndex, recordEndIndex],
            };

            fetchDataFromServer(options,
                function (result) {
                    result.currentStartIndex = recordStartIndex;
                    result.currentEndIndex = recordEndIndex;
                    deferred.resolve(result);
                },
                function (error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        }

        // V2.0.CF-I137 Start
        function resetAllMarkers() {
            hideInfoWindow();
            var markers = DataFactory.getAllsObjectGraphics();
            for (var objName in markers) {
                if (objName === 'primary-location') {
                    markers[objName].attributes = markers[objName].attributes || {};
                    if (markers[objName].attributes.originalSymbol) {
                        markers[objName].setSymbol(markers[objName].attributes.originalSymbol);
                    }
                } else {
                    for (var marker in markers[objName]) {
                        if (markers[objName][marker].attributes.originalSymbol) {
                            if (isSelected(marker) == marker) {
                                markers[objName][marker].setSymbol(markers[objName][marker].attributes.originalSymbol);
                            }
                        }
                    }
                }
            }
        }

        function highlightMarker(objectGraphic) {
            var isPrimary = (objectGraphic.getLayer().id == $scope.primaryLocationLayerId);
            objectGraphic.attributes = objectGraphic.attributes || {};
            objectGraphic.attributes.originalSymbol = objectGraphic.attributes.originalSymbol || objectGraphic.symbol;
            var newSymbol = isPrimary ?
                MapMarkerService.createLocationSymbol(
                    $scope.locationMarkerSettings.active.width,
                    $scope.locationMarkerSettings.active.height
                ) : MapMarkerService.createSymbol(
                    DataFactory.getMarkerPath()['secondary'],
                    $scope.lightenDarkenColor(objectGraphic.attributes.originalSymbol.color.toHex(), -50),
                    40, 1
                );
            objectGraphic.setSymbol(newSymbol);
        }

        // V2.0.CF-I22 Start
        function onMarkerClick(evt) {
            var id = evt.graphic.attributes.record.Id;
            //$timeout(function() {
            g_esri.map.centerAt(evt.graphic.geometry);
            if (isSelected(id) == id) {
                resetAllMarkers();
                highlightMarker(evt.graphic);
                $scope.isMarkerClicked = true;
            }
            if (!evt.graphic.attributes.record || !evt.graphic.attributes.sObjectName || !evt.graphic.attributes.sObjectData) return;
            $scope.showDetailPage(evt.graphic.attributes.record, evt.graphic.attributes.sObjectName, evt.graphic.attributes.sObjectData);
            highlightRow(evt.graphic.attributes.sObjectName, id);
            //}, 500);
        }
        // V2.0.CF-I22 End

        function highlightRow(sObjectName, recordid) {
            var sObJMetadata = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata, sObjectName, 'name');
            var selector = '#' + sObjectName + '-' + recordid;
            $(selector).css('outline', '2px solid ' + sObJMetadata.iconColor);
        }

        function onMarkerMouseOver(evt) {
            var id = evt.graphic.attributes.record.Id;
            if (isSelected(id) == id) {
                highlightMarker(evt.graphic);
            }
            /* If NOT (is showing and was invoked by click)*/
            if (!(g_esri.map.infoWindow.isShowing && g_esri.map.infoWindow.features)) {
                showInfoWindow(evt.graphic);
            }
        }

        function onMarkerMouseOut(evt) {
            // $scope.isMarkerClicked is used to handle immediate mouse over after click correctly (before updating info window features)
            if (isSourceOfInfoWindow(evt.graphic) || $scope.isMarkerClicked || isSelected(evt) == evt.graphic.attributes.record.Id) {
                showInfoWindow(evt.graphic);
                $scope.isMarkerClicked = false;
                return;
            }
            // V2.0.CF-I137 Start
            var id = evt.graphic.attributes.record.Id;
            if (isSelected(id) == id) {
                if (evt.graphic.attributes.originalSymbol)
                    evt.graphic.setSymbol(evt.graphic.attributes.originalSymbol);
            }
            // V2.0.CF-I137 End
            if (g_esri.map.infoWindow.isShowing && !g_esri.map.infoWindow.features && !$scope.isMarkerClicked) {
                hideInfoWindow();
            }
        }

        function isSelected(id) {
            if ($scope.selectedContacts.length != 0 || $scope.selectedLeads.length != 0) {
                dojo.forEach($scope.selectedLeads, function (p) {
                    if (p.Id == id) {
                        id = "0";
                        return;
                    }
                });
                dojo.forEach($scope.selectedContacts, function (p) {
                    if (p.Id == id) {
                        id = "0";
                        return;
                    }
                });
            }
            return id;
        }
        // V2.0.CF-I137 End

        function isSourceOfInfoWindow(graphic) {
            // g_esri.map.infoWindow.features[0] - marker that invoked info window by click
            // InfoWindow invoked by Hover event has no features
            return g_esri.map.infoWindow.features && graphic == g_esri.map.infoWindow.features[0];
        }

        function hideHighlitedBottomListRow() {
            $("#bottomListTableTbodyId tr").filter(function () {
                if ($(this).css('outline')) {
                    $(this).css("outline", "");
                }
            });
        }

        function hideAndClearColorboxData() {
            $('#ColorBoxId').hide();
            $scope.colorBoxData = {};
            $scope.dashboardComponent = {};
            $scope.publishedSegment = {};
        }

        function getDashboardPublishedData(dashboardId, adminSettingRecId, primaryLocation) {
            var deferred = $q.defer();
            // fetch initial app configuration
            var options = {
                url: 'ValgencfMAPPdev.PVMapController.fetchDashboardComponentPublishedData',
                params: [JSON.stringify(primaryLocation), adminSettingRecId, dashboardId],
            };
            fetchDataFromServer(options,
                function (result) {
                    //console.log('result==',JSON.stringify(result));
                    $scope.dashboardComponentData = result;
                    deferred.resolve(result);
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                },
                function (error) {
                    MessageService.showMessageOnMap(error, 'error');
                    deferred.reject("Fail");
                    LoadingProcessService.hide(G_LOADING_PROCESS_SELECTOR.app);
                })
            return deferred.promise;
        }

        function generateDashboardColorBoxAndChangeExistingMarkerColor(dashboardCompData) {
            var sObjectMarkerGraphics = DataFactory.getsObjectGraphicsByObject(dashboardCompData.sObjectName);

            if (!sObjectMarkerGraphics)
                return;
            var dashboardColorBoxDataMap = {};

            $scope.colorBoxData.isActive = true;
            var field_2APIName = dashboardCompData.field_2APIName;

            // Populate data for dashboard color box, it contains Label and total no of occurance.
            // Change Marker/Pin color to dashboard color
            for (var i = 0, tot = sObjectMarkerGraphics.length; i < tot; i++) {

                var recordId = sObjectMarkerGraphics[i].attributes.record.Id;
                var publishedAPIValue = dashboardCompData.markerData[recordId][field_2APIName];

                // Change Marker/Pin color to dashboard color
                var colorHexValue = dashboardCompData.groupData[publishedAPIValue]['color'];
                if (!colorHexValue)
                    colorHexValue = '#8f9462';
                sObjectMarkerGraphics[i].setSymbol(MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(colorHexValue).toHex(), 32, 2));

                // Populate data for dashboard color box, it contains Label and total no of occurance.
                if (publishedAPIValue in dashboardColorBoxDataMap) {

                    var colorBox = dashboardColorBoxDataMap[publishedAPIValue];
                    colorBox.count = colorBox.count + 1;
                    colorBox.markerGraphicRecordIds.push(recordId);
                    dashboardColorBoxDataMap[publishedAPIValue] = colorBox;
                } else {

                    var label = MapDashboardService.getLabelOfColorBoxValues(dashboardCompData, publishedAPIValue, recordId);
                    dashboardColorBoxDataMap[publishedAPIValue] = {
                        label: label,
                        count: 1,
                        color: colorHexValue,
                        selected: true,
                        markerGraphicRecordIds: [recordId]
                    };
                }
            }

            var dashboardColorBoxData = {};
            dashboardColorBoxData.rows = Object.values(dashboardColorBoxDataMap);
            dashboardColorBoxData.selectedAllColorBox = true;
            dashboardColorBoxData.totalCount = sObjectMarkerGraphics.length;
            dashboardColorBoxData.label = dashboardCompData.publishedLabel;
            dashboardColorBoxData.sObjectName = dashboardCompData.sObjectName;

            //Show color box data in sort order.
            dashboardColorBoxData.rows.sort(function (a, b) { // sort object by count field desc
                return b.count - a.count;
            })

            $scope.colorBoxData = dashboardColorBoxData;
            $scope.colorBoxData.isActive = true;
            //console.log($scope.colorBoxData);

            $('#ColorBoxId').show();
            $('.markers').mCustomScrollbar({
                theme: "dark",
                autoHideScrollbar: true
            });
        }

        function resetMarkerColorAndBottomListData(sObjectName) {

            var sObJMetadata = MapService.SearchArrayByAttribute($scope.initialMapConfig.sObjectsMetadata,
                sObjectName,
                'name');

            // Reset bottom list data.
            var sObjectRecords = $scope.sObjectDataTables[sObjectName].rows;
            var searchStr = $scope.sObjectDataTables[sObjectName].searchStr;

            if (searchStr) {

                sObjectRecords = $filter('filter')(sObjectRecords, searchStr);
            }

            $scope.sObjectDataTables[sObjectName].filtered = sObjectRecords;
            // V2.0.CF-I32 start
            updateSummary(sObjectName);
            // V2.0.CF-I32 end
            $scope.leftSidebar.records = sObjectRecords;


            // Records ids of Bottom list to whom maker will visible.
            var sObjectRecordIdsTOVisbleMarker = sObjectRecords.map(function (rec) {
                return rec.Id;
            });

            // Revert back marker color from Dashboard color to original object Icon color.
            var sObjectMarkerGraphics = DataFactory.getsObjectGraphicsByObject(sObjectName);
            for (var i = 0, tot = sObjectMarkerGraphics.length; i < tot; i++) {

                sObjectMarkerGraphics[i].setSymbol(MapMarkerService.createSymbol(G_MARKER_PATH.secondary, esri.Color.fromString(sObJMetadata.iconColor).toHex(), 32, 2));
                if (sObjectRecordIdsTOVisbleMarker.indexOf(sObjectMarkerGraphics[i].attributes.record.Id) != -1)
                    sObjectMarkerGraphics[i].show();
                if (isSobjectPrimary(sObjectMarkerGraphics[i].attributes.record.Id) && sObjectMarkerGraphics[i].visible)
                    sObjectMarkerGraphics[i].hide();
            }

        }

        function onBottomListSearchShowHideMarkers(sObjectRecords, sObjectName) {
            var sObjectMarkerGraphics = DataFactory.getsObjectGraphicsByObject(sObjectName);
            var sObjectRecIds = sObjectRecords.map(function (rec) {
                return rec.Id
            });

            for (i = 0; tot = sObjectMarkerGraphics.length, i < tot; i++) {
                var sObjectRecId = sObjectMarkerGraphics[i].attributes.record.Id;
                if (sObjectRecIds.indexOf(sObjectRecId) != -1 && !isSobjectPrimary(sObjectRecId))
                    sObjectMarkerGraphics[i].show();
                else
                    sObjectMarkerGraphics[i].hide();
            }
        }

        function isSobjectPrimary(sobjId) {
            return ($scope.initialMapConfig && $scope.initialMapConfig.primaryInfo && $scope.initialMapConfig.primaryInfo.recordId === sobjId);
        }
        // V3.0.CF-I225 & V3.0.PS1-T121 Start
        $scope.newMarkerExtent;

        function scaleAndCenter(sObjectName, shouldScale) {
            if (shouldScale == false) {
                $scope.newMarkerExtent = 0;
            }
            currentLocation = LocationFactory.getPrimaryMarkerObjData();
            var initialLocation = new esri.geometry.Point(currentLocation.longitude, currentLocation.latitude);
            var checkedSObjects = [sObjectName];
            var selectedGraphicsDetails = DataFactory.getVisibleSObjectGraphicsMaxDistance(checkedSObjects);
            $scope.newMarkerExtent = new esri.geometry.Extent(selectedGraphicsDetails.selectedGraphicsExtent[0]);
            for (var i = 0; i < selectedGraphicsDetails.selectedGraphicsExtent.length; i++) {
                var thisMarkerExtent = selectedGraphicsDetails.selectedGraphicsExtent[i];
                $scope.newMarkerExtent = $scope.newMarkerExtent.union(thisMarkerExtent);
            }
            var selectedSObjectIconCount = MapService.getSelectedSObjectIconCount($scope.initialMapConfig.sObjectsMetadata);
            console.log("length " + $scope.initialMapConfig.sObjectsMetadata.length)
            if (selectedSObjectIconCount == 1) {
                if ($scope.newMarkerExtent.spatialReference.wkid != 102100) {
                    $scope.newMarkerExtent = esri.geometry.geographicToWebMercator($scope.newMarkerExtent)
                }
                g_esri.map.setExtent($scope.newMarkerExtent)
            }
            if (shouldScale == false) {
                if ($scope.newMarkerExtent.spatialReference.wkid != 102100) {
                    $scope.newMarkerExtent = esri.geometry.geographicToWebMercator($scope.newMarkerExtent)
                }
                g_esri.map.setExtent($scope.newMarkerExtent)
            }
            g_esri.map.centerAt(initialLocation);
        }
        // V3.0.CF-I225 & V3.0.PS1-T121 End

        /*function scaleAndCenter(sObjectName) {
            console.log("newMarkerExtent " + newMarkerExtent);
            currentLocation = LocationFactory.getPrimaryMarkerObjData();
            var initialLocation = new esri.geometry.Point(currentLocation.longitude, currentLocation.latitude);
            var checkedSObjects = [sObjectName];
            var selectedGraphicsDetails = DataFactory.getVisibleSObjectGraphicsMaxDistance(checkedSObjects);
            var newMarkerExtent = new esri.geometry.Extent(selectedGraphicsDetails.selectedGraphicsExtent[0]);
            for (var i = 0; i < selectedGraphicsDetails.selectedGraphicsExtent.length; i++) {
                var thisMarkerExtent = selectedGraphicsDetails.selectedGraphicsExtent[i];
                newMarkerExtent = newMarkerExtent.union(thisMarkerExtent);
            }
            var selectedSObjectIconCount = MapService.getSelectedSObjectIconCount($scope.initialMapConfig.sObjectsMetadata);
            console.log("length " + $scope.initialMapConfig.sObjectsMetadata.length)
            if (selectedSObjectIconCount == 1) {
                if (newMarkerExtent.spatialReference.wkid != 102100) {
                    newMarkerExtent = esri.geometry.geographicToWebMercator(newMarkerExtent)
                }
                g_esri.map.setExtent(newMarkerExtent)
                console.log("setExtent")
            }
            g_esri.map.centerAt(initialLocation);
        }*/

        window.invokeActionByInfoWindow = function (sObjectName, actionType, recordID) {
            $scope.invokeAction(sObjectName, actionType, recordID);
        }

        function clearMap() {
            // Clear Dashboard color box.
            $('#ColorBoxId').hide();
            $scope.dashboardComponent = {};
            $scope.publishedSegment = {};
            $scope.dashboardComponentData = {};

            if ($scope.initialMapConfig && $scope.initialMapConfig.sObjectsMetadata.length > 0) {
                var sObjectName = $scope.initialMapConfig.sObjectsMetadata[0].name;
                $(".objectListContainer").removeClass("active"); // Close bottom list panel
                // Deselect available object List
                $('#availabelOjectListId li').removeClass('selected');
                angular.forEach($scope.initialMapConfig.sObjectsMetadata, function (rec) {
                    rec.isObjectSelected = false;
                });
                // Reinitialize leftsidebar data
                initializeLeftsidebar();

                // Delete bottom list data and esri marker graphics data.
                $scope.sObjectDataTables = {};
                DataFactory.destroyAllsObjectGraphics(g_esri.map);
                $scope.$apply();
            }
        }


        function fetchDataFromServer(options, successCallback, failuerCallback) {
            DataFactory.invokeRemoteAction(options).then(

                // success function
                function (result) {
                    if (result && result.isSuccess) {
                        successCallback(result.data);
                    } else {
                        failuerCallback(result.message);
                    }
                },

                // error function
                function (error) {
                    failuerCallback(error);
                }
            );
        }

        // V2.0.CF-I32 start
        function updateSummary(sObjectName) {
            var sum = 0;
            try {
                if (!$scope.sObjectDataTables[sObjectName].summaryField.name) {
                    $scope.sObjectDataTables[sObjectName].calculatedSum = 'n/a';
                }
                if ($scope.sObjectDataTables[sObjectName] && $scope.sObjectDataTables[sObjectName].rows
                    && $scope.sObjectDataTables[sObjectName].summaryField.name) {
                    for (var item of $scope.sObjectDataTables[sObjectName].filtered) {
                        var currentValue = item[$scope.sObjectDataTables[sObjectName].summaryField.name];
                        if (angular.isNumber(currentValue)) {
                            sum += currentValue;
                        }
                    }
                    $scope.sObjectDataTables[sObjectName].calculatedSum = sum.toLocaleString();
                }
            } catch (err) {
                console.log('calculation summary error');
            }
        }
        // V2.0.CF-I32 end

        /**
         * [calculateEsriMapHeight description]
         * @return {[type]} [Calculate and set esri map height]
         */
        function getEsriMapHeight() {
            var windowHeight = $(window).height();
            var mapOffset = $('#map').offset().top;
            var mapHeight = windowHeight - mapOffset;
            return mapHeight;
        }
        for (var pluginIndex in pluginFunctions)
            pluginFunctions[pluginIndex]();
    });