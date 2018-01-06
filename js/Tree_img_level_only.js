var draw = function() {
    // Get JSON data    
    treeData= new initData().text;

    // 平移变量
    var panSpeed = 200;
    var panBoundary = 40; // 拖动时，距离边缘20像素以内会平移.
    // 其他. 变量
    var i = 0;
    var duration = 750;
    var root;

    var imgWidth = 50;
    var imgHeight = 40;

    var tree = d3.layout.tree()
        .nodeSize([2,200])
        .separation(function separation(a, b) {
            var temp_s = 0;
            //保证同级别之间的间隔是正常的
            if(a.depth>2){
                temp_s = (a.parent == b.parent ? 10 : 20) * a.depth;                    
            }else{
                temp_s = (a.parent == b.parent ? 30 : 20) * 1.5;              
            }      
            return temp_s;
        });
    
    //定义树节点手肘连线
    function elbow(d) {
        var sourceX = d.source.x,
            sourceY = d.source.y + (imgWidth / 2),
            targetX = d.target.x,
            targetY = d.target.y - (imgWidth / 2);
            
        return "M" + sourceY + "," + sourceX
          + "H" + (sourceY + (targetY-sourceY)/2)
          + "V" + targetX 
          + "H" + targetY;
      }
      
      /**
       * Use a different elbow function for enter
       * and exit nodes. This is necessary because
       * the function above assumes that the nodes
       * are stationary along the x axis.
       */
      function transitionElbow(d){
        return "M" + d.source.y + "," + d.source.x
          + "H" + d.source.y
          + "V" + d.source.x 
          + "H" + d.source.y;
      }

    //保证树能够更好进行平移展示
    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // 定义缩放角度方向
    function zoom() {
        // //console.log("zoom");
        // //console.log(d3.event.translate ,d3.event.scale);
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener定义baseSvg，附加样式的类和zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    
    // 折叠节点
    function collapse(d) {
        // debugger;
        //console.log(d.children);
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    // 展开节点  
    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    //保证页面能够聚焦到你正在操作的节点
    function centerNode(source) {
        //最后聚焦到树中点展示效果
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    //保证树节点点击能够做到信息展开
    function click(d) {
        // if (d3.event.defaultPrevented) return; // click suppressed
        // if (!!d.open&&d.open) return;
        if (!d.children&&!d._children) return;        
        d = toggleChildren(d);
        update(d);
        centerNode(d);

    }

    function update(source) {
        if(source==root){
            if(!!source.children){
                //保证初始加载树节点只加载一级
                source.children.forEach(function(d) {
                    toggleChildren(d);                
                }); 
            }
        }

        var nodes = tree.nodes(root),
        links = tree.links(nodes);

        // 重新获取树上的所有节点
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {              
                return d.id || (d.id = ++i);
            });
         
        
        // 插入节点信息
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")         
            .attr("transform", function(d) {
                return 'translate(' + (source.y0 + imgWidth/2) + ',' + source.x0 + ')';
            })
            .on('click', click);
        
        //插入节点对应的图片
        nodeEnter.append('svg:image')
            .attr('xlink:href',function(d) {
                // //console.log("svg:image"+d.depth);
                return d.url;
            })
            .attr('x',function(d) {
                return d.children || d._children ? -(imgWidth/2) : 10;
            })
            .attr('y',function(d) {
                return d.children || d._children ? -(imgHeight/2) : 10;
            })
            .attr('width',function(d) {
                return d.children || d._children ? imgWidth : 0;
            })
            .attr('height',function(d) {
                return d.children || d._children ? imgHeight : 0;
            });

        //插入节点对应的文字
        nodeEnter.append("text")
            .attr("dx", "-2em")
            .attr("dy", function(d) {
                return d.children || d._children ? imgHeight : 0;
            })            
            .attr('class', 'nodeText')
            .attr("text-anchor", "start")
            .text(function(d) {
                return d.name;
            })
            .style('fill-opacity', 0);
       
        // 新建节点之后，更新每个节点的显示状态
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });
            
        //保证节点完全插入之后，再更新节点文字填充状态
        nodeUpdate.select("text")
            .style('fill-opacity', 1); 

        // 设置节点消失动画
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
        //避免连线消失动画和节点消失不同步情况

        //在节点消失的时候，清除图片的宽度和高度
        nodeExit.select("image")
            .attr('width',0)
            .attr('height',0);

        //在节点消失的时候，清除文字的填充颜色
        nodeExit.select("text")
            .style("fill-opacity", 0);

        // 更新连线信息
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });
        
        // 设置手肘连线初始数据
        link.enter().insert("path", "g")
            .attr("class","link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: (source.y0 + imgWidth/2)};
                return transitionElbow({source: o, target: o});
            });
     
        // 设置手肘线产生动画。
        link.transition()
            .duration(duration)
            .attr("d", elbow);            

        // 设置手肘线消失动画
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: (source.y + imgWidth/2)};
                return transitionElbow({source: o, target: o});
            })
            .remove();

        
        // 存储在变化前的x和y信息
        nodes.forEach(function(d) {
            // console.log(d);
            
            d.x0 = d.x;
            d.y0 = d.y;
            if(!d.parent){
                d.open = true;
            }else{
                d.open = false;
            
                d.parent.open = true;
            }

            //保证从规定级别开始只有一个节点保持展开状态
            // if(d.depth >= n_level){
            //     if(d.children !=undefined){
            //         d.children.forEach(collapse);                   
            //     }
            // }              
        });
    }

    // 定义一个包含所有节点的g(group)
    var svgGroup = baseSvg.append("g");

    // 定义初始数据
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // 对初始数据进行树形绘制
    update(root);
    //并把页面焦点聚焦到初始根节点上
    centerNode(root);
};
