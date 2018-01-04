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
    var duration = 50;
    var root;

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    //自定义折线路径
    function elbow(d) {
        return "M" + d.source.y + "," + d.source.x
        + "H" + (d.source.y + (d.target.y-d.source.y)/2)
        + "V" + d.target.x 
        + "H" + d.target.y;
    }       
    // 通过遍历所有节点执行一些设置的递归辅助函数

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;
        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength调用访问函数来建立maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names根据节点名称对树进行排序

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

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
            // console.log("pan");
            // console.log(scaleY ,scaleX);
            // console.log(translateY ,translateX);
            
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }
    // Define the zoom function for the zoomable tree
    function zoom() {
        // console.log("zoom");
        // console.log(d3.event.translate ,d3.event.scale);
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).attr('class', 'node activeDrag');

        svgGroup.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's选择父项并对路径进行排序
            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back一个是不是徘徊的元素，发送“一个”的后面
            else return -1; // a is the hovered element, bring "a" to the front一个是盘旋的元素，把“a”带到前面
        });
        // if nodes has children, remove the links and nodes如果节点有子节点，则删除链接和节点
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            nodePaths = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id;
                }).filter(function(d, i) {
                    if (d.id == draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        svgGroup.selectAll('path.link').filter(function(d, i) {
            if (d.target.id == draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener定义baseSvg，附加样式的类和zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

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

    // Toggle children on click.

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
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
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.计算新的树形布局。
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.根据maxLabelLength设置级别之间的宽度。
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
            //或者保持一个固定的比例，可以设置一个固定的深度
            //通过注释下面的行来标准化为固定深度
            // d.y =（d.depth * 500）; //每个级别500px
        });

        // Update the nodes…更新节点...
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.在父母的上一个位置输入任何新节点。
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                console.log("nodeEnter");
                console.log(d.name,source.y0 ,source.x0);
                console.log(d.y ,d.x); 
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append('svg:image')
            .attr('xlink:href',function(d) {
                return d.url;
            })
            .attr('x',function(d) {
                return d.children || d._children ? -40 : 10;
            })
            .attr('y',function(d) {
                return d.children || d._children ? -20 : 10;
            })
            .attr('width',function(d) {
                return d.children || d._children ? 50 : 0;
            })
            .attr('height',function(d) {
                return d.children || d._children ? 40 : 0;
            })

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? "1em" : 10;
            })
            .attr("dy", function(d) {
                return d.children || d._children ? "35px" : "0.35em";
            })
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // Update the text to reflect whether node has children or not.更新文本以反映节点是否有子节点。
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? "1em" : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

        // Transition nodes to their new position.将节点转换到新位置。
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                console.log("nodeUpdate");
                console.log(d.name,source.y0 ,source.x0);
                console.log(d.name,d.y ,d.x); 
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.将节点转移到父节点的新位置。
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                console.log("nodeExit");                
                console.log(d.name,source.y0 ,source.x0);
                console.log(d.name,source.y ,source.x);
                console.log(d.name,d.y ,d.x);
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("image")
            .attr('width',0)
            .attr('height',0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.在父母的上一个位置输入任何新链接。
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", elbow);
            

        // Transition links to their new position.转换链接到他们的新位置。
        link.transition()
            .duration(duration)
            .attr("d", elbow);

        // Transition exiting nodes to the parent's new position.将节点转移到父节点的新位置。
        link.exit().transition()
            .duration(duration)
            .attr("d", elbow)
            .remove();

        // Stash the old positions for transition.把旧的职位藏起来过渡。
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
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
