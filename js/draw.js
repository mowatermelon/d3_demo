var treeData='';
var viewerWidth='';
var viewerHeight='';

function initData() {
  this.text ={
    "name": "西瓜",
    "children": [
      {
        "name": "西瓜01",
        "children": [
          {
            "name": "西瓜01_1",
            "children": [
              {
                "name": "melon01_1",
                "size": 3938
              },
              {
                "name": "melon01_2",
                "size": 3812
              },
              {
                "name": "melon01_3",
                "size": 6714
              },
              {
                "name": "melon01_4",
                "size": 743
              }
              ,
              {
                "name": "water01_5",
                "size": 743
              },
              {
                "name": "water01_6",
                "size": 743
              },
              {
                "name": "water01_7",
                "size": 743
              },
              {
                "name": "water01_8",
                "size": 743
              },
              {
                "name": "water01_9",
                "size": 743
              }
            ]
          },
          {
            "name": "西瓜01_2",
            "children": [
              {
                "name": "mo02_1",
                "size": 3534
              },
              {
                "name": "mo02_2",
                "size": 5731
              },
              {
                "name": "mo02_3",
                "size": 7840
              },
              {
                "name": "mo02_4",
                "size": 5914
              },
              {
                "name": "mo02_5",
                "size": 3416
              },
              {
                "name": "mo02_6",
                "size": 3416
              },
              {
                "name": "mo02_7",
                "size": 3416
              },
              {
                "name": "mo02_8",
                "size": 3416
              },
              {
                "name": "mo02_9",
                "size": 3416
              },
              {
                "name": "mo02_10",
                "size": 3416
              },
              {
                "name": "mo02_11",
                "size": 3416
              },
              {
                "name": "mo02_12",
                "size": 3416
              },
              {
                "name": "mo02_13",
                "size": 3416
              },
              {
                "name": "mo02_14",
                "size": 3416
              },
              {
                "name": "mo02_15",
                "size": 3416
              },
              {
                "name": "mo02_16",
                "size": 3416
              },
              {
                "name": "mo02_17",
                "size": 3416
              }
            ]
          },
          {
            "name": "西瓜01_3",
            "children": [
              {
                "name": "lucky03_1",
                "size": 7074
              },
              {
                "name": "lucky03_2",
                "size": 7074
              },{
                "name": "lucky03_3",
                "size": 7074
              }
            ]
          }
        ]
      },
      {
        "name": "西瓜02",
        "children": [  
          {
            "name": "西瓜02_1",
            "children": [
              {
                "name": "lucky01_1",
                "size": 1983
              }
            ]
          },
           {
            "name": "西瓜02_2",
            "children": [
              {
                "name": "lucky02_1",
                "size": 1983
              },
              {
                "name": "lucky02_2",
                "size": 1983
              },
              {
                "name": "lucky02_3",
                "size": 1983
              },
              {
                "name": "lucky02_4",
                "size": 1983
              },
              {
                "name": "lucky02_5",
                "size": 1983
              },
              {
                "name": "lucky02_6",
                "size": 1983
              }
            ]
          },
           {
            "name": "西瓜02_3",
            "children": [
              {
                "name": "water03_1",
                "size": 1983
              },
              {
                "name": "water03_2",
                "size": 1983
              }
            ]
          },
           {
            "name": "西瓜02_4",
            "children": [
              {
                "name": "lucky04_1",
                "size": 1983
              },
              {
                "name": "lucky04_2",
                "size": 1983
              },
              {
                "name": "lucky04_3",
                "size": 1983
              },
              {
                "name": "lucky04_4",
                "size": 1983
              },
              {
                "name": "lucky04_5",
                "size": 1983
              },
              {
                "name": "lucky04_6",
                "size": 1983
              }
            ]
          },
           {
            "name": "西瓜02_5",
            "children": [
              {
                "name": "mo05_1",
                "size": 1983
              },
              {
                "name": "mo05_2",
                "size": 1983
              },
              {
                "name": "mo05_3",
                "size": 1983
              },
              {
                "name": "mo05_4",
                "size": 1983
              },
              {
                "name": "mo05_5",
                "size": 1983
              },
              {
                "name": "mo05_6",
                "size": 1983
              }
            ]
          }
        ]
      },
      {
        "name": "西瓜03",
        "children": [
          {
            "name": "西瓜03_1",
            "children": [
              {
                "name": "hhh01_1",
                "size": 721
              },
              {
                "name": "hhh01_2",
                "size": 4294
              },
              {
                "name": "hhh01_3",
                "size": 9800
              },
              {
                "name": "hhh01_4",
                "size": 1314
              },
              {
                "name": "hhh01_5",
                "size": 2220
              }
              ,
              {
                "name": "hhh01_6",
                "size": 4294
              },
              {
                "name": "hhh01_7",
                "size": 9800
              },
              {
                "name": "hhh01_8",
                "size": 1314
              },
              {
                "name": "hhh01_9",
                "size": 2220
              },
              {
                "name": "hhh01_10",
                "size": 9800
              }
            ]
          }
        
        ]
      }
    ]
  }
}

$(function () {
  // 图的大小
  viewerWidth = $(document).width();
  viewerHeight = $(document).height();
  draw();
})