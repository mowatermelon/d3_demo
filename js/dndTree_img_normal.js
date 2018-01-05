var draw = function() {
    // Get JSON data    
    treeData= new initData().text;
    // 计算总节点，最大标签长度
    var totalNodes = 0;
    var maxLabelLength = 0;
    // 变量 
    var selectedNode = null;
    var draggingNode = null;
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
        .size([viewerHeight, viewerWidth]);
    
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

    // TODO: Pan function, can be better implemented.
    function zoomF() {
        // console.log("zoom");
        // console.log(d3.event.translate ,d3.event.scale);
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoom = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomF);

    // Setup zoom and pan
    // var zoom = d3.behavior.zoom()
    //     .scaleExtent([0.1, 3])
    //     .on('zoom', function(){
    //         svgGroup.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    //     })
    //     // Offset so that first pan and zoom does not jump back to the origin
    //     .translate([150, 200]);

    // define the baseSvg, attaching a class for styling and the zoomListener定义baseSvg，附加样式的类和zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoom);

    // Helper functions for collapsing and expanding nodes.助手功能用于折叠和展开节点。

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.点击/丢弃时，节点居中的功能，使得在折叠/移动大量子节点时节点不会丢失。

    function centerNode(source) {
        //最后聚焦到树中点展示效果
        scale = zoom.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        console.log(x,y);
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoom.scale(scale);
        zoom.translate([x, y]);
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

    // Toggle children on click.

    function click(d) {

        // console.log("hjh");
        // console.log(d3.events);
        // if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        //计算新的高度，函数统计根节点的总数，并相应地设置树高。
        //这样可以防止当新节点变得可见时布局看起来被挤压，或者当节点被移除时看起来稀疏
        //这使得布局更一致。
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * imgHeight * 3; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);
  
        // Update nodes    
        var node = svgGroup.selectAll("g.node")
            
        // The function we are passing provides d3 with an id
        // so that it can track when data is being added and removed.
        // This is not necessary if the tree will only be drawn once
        // as in the basic example.
        .data(nodes, function(d){ return d.name; });
            
        // Add any new nodes
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on('click', click);
    
        // Draw the rectangle person boxes
        nodeEnter.append('svg:image')
            .attr('xlink:href',function(d) {
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
            })
    
        // Draw the person's name and position it inside the box
        nodeEnter.append("text")
            .attr("dx", -(imgWidth/2) + 10)
            .attr("dy", 0)
            .attr("text-anchor", "start")
            .attr('class', 'name')
            .text(function(d) { 
            return d.name; 
            });
        
        // Update the position of both old and new nodes
        node.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        
        // Remove nodes we aren't showing anymore
        node.exit().remove();
    
        // Update links
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });
        
        // Add new links    
        link.enter().insert("path")
            .attr("class", "link")
            .attr("d", elbow);
        
        // Remove any links we don't need anymore
        // if part of the tree was collapsed
        link.exit().remove();
        
        // Update the links positions (old and new)
        link.attr("d", elbow);
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.附加一个包含所有节点和缩放监听器可以处理的组。
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.最初布局树并居中在根节点上。
    update(root);
    centerNode(root);
};
