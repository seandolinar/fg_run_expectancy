
// data = [[0.481, 0.254, 0.098],
//     [0.859, 0.509, 0.224],
//     [1.1, 0.664, 0.319],
//     [1.437, 0.884, 0.429],
//     [1.35, 0.95, 0.353],
//     [1.784, 1.13, 0.478],
//     [1.964, 1.376, 0.58],
//     [2.292, 1.541, 0.752]]

var m = {
    initVar: function() {
        m.outs = [0, 1, 2]
        m.baseStates = [0, 1, 2, 3, 4, 5, 6, 7]
        m.baseStatesLabel = {
            0: '_ _ _',
            1: '1 _ _',
            2: '_ 2 _',
            3: '1 2 _',
            4: '_ _ 3',
            5: '1 _ 3',
            6: '_ 2 3',
            7: '1 2 3'
        }
        m.uOuts = 0
        m.uBaseStates = 0
        m.uWoba = .300
        m.uRunEnv = 4.0
    },
    table: function() {

        var reTable = d3.select('.box-1')
            .append('table')
            .attr('class', 're-table')
            
        reTh = reTable
            .append('tr')
            
        reTh.append('th') 
            
        reTh.selectAll('th.outs')
            .data(m.outs)
            .enter()
            .append('th')
            .text(function (d) {return d;})
        
        reTable.selectAll('tr.val')
            .data(m.data)
            .enter()
            .append('tr')
            .attr('class','val')
            .attr('data-row', function(d,i) {return i;})
                        
        d3.selectAll('tr.val')
            .data([],function(d,i) {
                d3.select(this)
                    .append('td')
                    .text(m.baseStatesLabel[i])
                    
                d3.select(this)
                    .selectAll('td.val')
                    .data(d)
                    .enter()
                    .append('td')
                    .attr('data-column', function(d,i) {return i;})
                    .text(function(d) {return d.toFixed(3);})
            })

    },
    highlightTable: function() {
        $('td').removeClass('highlight')
        $('[data-row="' + m.uBaseStates + '"] [data-column="' + m.uOuts + '"]').addClass('highlight')
    },
    interactive: function() {
        
        //outs
        d3.selectAll('.out').on('click', function() {
            d3.select(this).classed('active') ? m.uOuts-- : m.uOuts++   
            
           d3.selectAll('.out').classed('active', false)
                   
            d3.selectAll('.out').filter(function(d,i) {
                return i < m.uOuts
            }).classed('active', true)
            m.highlightTable()
        })
        
        //bases
        d3.selectAll('.base').on('click', function() {
            $(this).toggleClass('active')
            
            var uBaseStates = ''
            d3.selectAll('.base').each(function(d,i) {
                uBaseStates = d3.select(this).classed('active') ? '1' + uBaseStates :  '0' + uBaseStates
                m.uBaseStates = parseInt(uBaseStates, 2)
            })
            m.highlightTable()
        })
    },
    runData: function() {
        d3.csv('/data/re-emp.csv', function(data) {
            data = data
                .filter(function(d) {return d.RunEnv_ == m.uRunEnv})
                .filter(function(d) {return d.wOBA == m.uWoba})
            data.forEach(function(d) {
                d.baseState = parseInt(d['3B'] + d['2B'] + d['1B'],2)
            });
            data.sort(function(a,b) {
                if (a.baseState == b.baseState) {
                    return a.Outs - b.Outs
                }
                else {          
                    return a.baseState - b.baseState
                }
            })
            data = data.map(function(d) {return parseFloat(d.RE)})
            
            dataFull = []
            dataPart = []
            data.forEach(function(d,i) {
                i % 3 == 0 && i != 0 ? (dataFull.push(dataPart), dataPart = [d])  : dataPart.push(d)
            })
            dataFull.push(dataPart) //figure out how to include this
            m.data = dataFull
            m.table()
        })
    }
}

m.initVar()
m.interactive()
m.runData()
