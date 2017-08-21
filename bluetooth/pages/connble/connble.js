/** connble.js */

Page({
  data: {
    deviceId: '',
    name: '',
    RSSI: '',
    advData: '',
    serviceId: '',
    serviceList: [],
    serviceUUID: '',
    select: '',
    characteristics: [],
    readCharacterUUid: '',
  },

  onLoad: function (opt) {
    var that = this;
    console.log("onLoad");
    console.log('deviceId=' + opt.deviceId);
    console.log('name=' + opt.name);
    console.log('RSSI=' + opt.RSSI);
    console.log('advData=' + opt.advData);
    //get data from scanble page url.
    that.setData({
      RSSI: opt.RSSI,
      name: opt.name,
      deviceId: opt.deviceId,
      advData: opt.advData,
    });
  },

  bindConnect: function () {
    var that = this;
    //create ble connection
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      //create conn. success
      success: function (res) {
        console.log(res);
        //get device services
        wx.getBLEDeviceServices({
          deviceId: that.data.deviceId,
          success: function (res) {
            console.log('device services:', res.services);
            that.setData({
              serviceList: res.services,
            })
            console.log('serviceList:', that.data.serviceList);
          },
        });
      },
      //create conn. fail
      fail: function (res) {
        wx.showToast({
          title: '建立连接失败',
          icon: 'loading',
          duration: 2000
        })
      },
    })

    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    })

  },

  selectUUID: function (e) {
    var that = this;
    var uuid = e.currentTarget.dataset.uuid;
    console.log(uuid);
    //show selected service uuid
    that.setData({
      serviceUUID: uuid,
      select: 1,
    })

  },

  getCharc: function () {
    var that = this;
    if(that.data.select == ''){
      wx.showToast({
        title: '请先选择service uuid',
        icon: 'loading',
        duration: 2000
      })
    }
    //get specify sercive all of charc.
    wx.getBLEDeviceCharacteristics({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceUUID,
      success: function(res) {
        console.log('getBLEDeviceCharacteristics:', res.characteristics)
        that.setData({
          characteristics: res.characteristics,
        })
      },
    })

  },
  readCharcter: function (e) {
    var that = this;
    var readCharacterUUid = e.currentTarget.dataset.uuid;
    console.log('readCharacterUUid:--------', readCharacterUUid)
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.serviceUUID,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: readCharacterUUid,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
      }
    })
   
    // 必须在这里的回调才能获取
    wx.onBLECharacteristicValueChange(function (characteristic) {
      if (characteristic == readCharacterUUid){
        wx.readBLECharacteristicValue({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
          deviceId: that.data.deviceId,
          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
          serviceId: that.data.serviceUUID,
          // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
          characteristicId: readCharacterUUid,
          success: function (res) {
            console.log('readBLECharacteristicValue:', res.characteristic.value)
          }
        })
      }
      console.log('characteristic value comed:', characteristic)
    })

    wx.onBLECharacteristicValueChange(function (res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${(res.value)}`)
      var dataView = new DataView(res.value);
      var int8View = new Int8Array(res.value);
      console.log(dataView.getInt32(0).toString(16)); 
      console.log(dataView.getInt8(0).toString(16)); 
      console.log(int8View[0].toString(16));//
    
    })

  },
  ab2str:function (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  },
  str2ab :function (str) {
      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }
  })
