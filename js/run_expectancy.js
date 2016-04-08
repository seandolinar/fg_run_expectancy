function baseballFormat(d) {
    if (d < 1) {
        return d.toFixed(3).slice(1, 5);
    }
    else {
        return d.toFixed(3)
    }

}



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
        m.uType = 'emp'

        m.wobaArray = []
        for (i = .420; i >= .240; i = i - .010) {
            m.wobaArray.push(baseballFormat(i))
        }

        m.runEnvArray = []
        for (i = 5; i >= 3.75; i = i - .25) {
            m.runEnvArray.push(i.toFixed(2))
        }
        
        m.reRange = []
    },
    foundation: function() {
         d3.selectAll('.box-1').selectAll('*').remove()

        var reTable = d3.select('.box-1')
            .append('table')
            .attr('class', 're-table')

        reLabel = reTable.append('tr')
        reLabel.append('th').attr('colspan',2)
        reLabel.append('th').attr('colspan',3).style('font-size', '14px').text('Outs')

        reTh = reTable
            .append('tr')
                    
        reTh.append('th').attr('colspan',2)

        reTh.selectAll('th.outs')
            .data(m.outs)
            .enter()
            .append('th')
            .text(function(d) { return d; })

        reTable.selectAll('tr.val')
            .data(m.data)
            .enter()
            .append('tr')
            .attr('class', 'val')
            .attr('data-row', function(d, i) { return i; })
            
            d3.select('tr.val').append('td').attr('rowspan',8).attr('class','box_rotate').style('font-size', '14px').text('Base State')
            
            d3.selectAll('.box-1').append('div').style('text-align', 'center').style('font-size', '12px').style('width', '300px').style('margin', 'auto').text('All values are average runs scored from that point until the end of the inning.')
            
    },
    table: function() {

        m.foundation()
        d3.selectAll('tr.val')
            .data([], function(d, i) {
                d3.select(this)
                    .append('td')
                    .text(m.baseStatesLabel[i])

                d3.select(this)
                    .selectAll('td.val')
                    .data(d)
                    .enter()
                    .append('td')
                    .attr('data-column', function(d, i) { return i; })
                    .text(function(d) { return d.main.toFixed(3); })
            })

    },
    highlightTable: function() {
        $('td').removeClass('highlight')
        $('[data-row="' + m.uBaseStates + '"] [data-column="' + m.uOuts + '"]').addClass('highlight')
    },
    graph: function() {
        
        //get reference
        m.foundation()
        m.runRef()
        console.log(m.data)
        var X = d3.scale.linear().domain(d3.extent(m.reRange.concat(m.reRangeRef))).range([0,95])
        
        d3.selectAll('tr.val')
            .data([], function(d, i) {
                d3.select(this)
                    .append('td')
                    .text(m.baseStatesLabel[i])
                    
                var cell = d3.select(this)
                    .selectAll('td.val')
                    .data(d)
                    .enter()
                    .append('td')
                    .attr('data-column', function(d, i) { return i; })
                    
                    cell                    
                    .append('div')
                    .style('background-color', 'grey')
                    .style('width', function(d) { return X(d.ref) + '%' ;})          
                    .style('height', '50%')
                    .attr('class', 'data-bar')
                    .attr('data-type', 'ref')
                    
                    
                    cell
                    .append('div')
                    .style('background-color', '#336699')
                    .style('width', function(d) { return Math.max(X(d.main),0) + '%';})
                    .style('height', '50%')
                    .attr('class', 'data-bar')
                    .attr('data-type', 'main')
            })
            
            d3.selectAll('.data-bar').on('mouseover', function() {
                
                var type = d3.select(this).attr('data-type')
                
                d3.select(this)
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('width', '80px')
                    .style('height', '26px')
                    .style('position', 'absolute')
                    .style('right', '-87px')
                    .style('bottom', '-4px')
                    .style('z-index', '99')
                    .style('color', 'white')
                    .style('font-size', '12px')
                    .style('line-height', '2')
                    .style('background-color', 'rgba(0,0,0,.8)')
                    .text(function(d) {return d[type].toFixed(3) + ' runs';})
                    .append('div')
                    .attr('class', 'arrow-left')
            }).on('mouseout', function() {
                d3.selectAll('.tooltip').remove()
            })

            var legend = d3.select('.box-1').insert("div",":first-child").attr('class', 'legend-box').style('text-align', 'center').style('position', 'relative').style('display', 'flex').style('margin', 'auto').style('font-size', '12px').style('margin-bottom', '10px')
            legend.append('div').style('line-height','20px').style('margin-right', '20px').text('All Players').append('div').style('width', '20px').style('height', '20px').style('background-color', 'grey').style('margin-right', '5px').style('float', 'left')
            legend.append('div').style('line-height','20px').text('wOBA Bucket').append('div').style('width', '20px').style('height', '20px').style('background-color', '#336699').style('margin-right', '5px').style('float', 'left')

    },
    build: function() {

        d3.selectAll('.bin').html('')
        if (m.uType == 'emp') {
            d3.selectAll('.bin.woba').append('label').text('wOBA')
            d3.selectAll('.bin.woba').append('select').classed('param woba', true)
            m.wobaArray.forEach(function(d, i) {
                d3.select('.param.woba').append('option').attr('label', d).attr('value', d)
            })

            d3.selectAll('.bin.runenv').append('label').text('Run Environment')
            d3.selectAll('.bin.runenv').append('select').classed('param runenv', true)
            m.runEnvArray.forEach(function(d, i) {
                d3.select('.param.runenv').append('option').attr('label', d).attr('value', d)
            })
            
            $('.param.woba').val('.300')
            $('.param.runenv').val('4.00')
            m.uWoba = $('.param.woba').val()
            m.uRunEnv = $('.param.runenv').val()

        }
        else {
            d3.selectAll('.bin.woba').append('label').text('wOBA')
            d3.selectAll('.bin.woba').append('input').classed('param woba', true)
                .attr('type', 'number')
                .attr('min', '.250')
                .attr('max', '.420')
                .attr('step', '.001')

            d3.selectAll('.bin.runenv').append('label').text('Run Environment')
            d3.selectAll('.bin.runenv').append('input').classed('param runenv', true)
                .attr('type', 'number')
                .attr('min', '3.0')
                .attr('max', '6.0')
                .attr('step', '.1')
            m.runSmo()
            $('.param.woba').val(m.uWoba)
            $('.param.runenv').val(m.uRunEnv)
        }

    },
    interactive: function() {

        //outs
        d3.selectAll('.out').on('click', function() {
            d3.select(this).classed('active') ? m.uOuts-- : m.uOuts++

            d3.selectAll('.out').classed('active', false)

            d3.selectAll('.out').filter(function(d, i) {
                return i < m.uOuts
            }).classed('active', true)
            m.highlightTable()
        })

        //bases
        d3.selectAll('.base').on('click', function() {
            $(this).toggleClass('active')

            var uBaseStates = ''
            d3.selectAll('.base').each(function(d, i) {
                uBaseStates = d3.select(this).classed('active') ? '1' + uBaseStates : '0' + uBaseStates
                m.uBaseStates = parseInt(uBaseStates, 2)
            })
            m.highlightTable()
        })

        //woba
        d3.selectAll('.param.woba').on('change', function() {
            m.uWoba = $(this).val()
            m.uType == 'emp' ? m.runData() : m.runSmo()
        })

        //runenv
        d3.selectAll('.param.runenv').on('change', function() {
            m.uRunEnv = $(this).val()
            
            m.uType == 'emp' ? m.runData() : m.runSmo()
            
        })

        //type
        d3.selectAll('.div-button.type').on('click', function() {
            d3.selectAll('.div-button.type').classed('active', false)
            d3.select(this).classed('active', true)
            m.uType = d3.select(this).attr('value')
            m.uType == 'emp' ? m.runData() : m.runSmo()
            m.build()
            m.interactive()
        })
        
        //display
        d3.selectAll('.div-button.display').on('click', function() {
            d3.selectAll('.div-button.display').classed('active', false)
            d3.select(this).classed('active', true)
            m.uDisplay = d3.select(this).attr('value')
            
            m.uDisplay == 'table' ? m.table() : m.graph()
        })
    },
    makeArray: function(data, dataRef) {
            dataFull = []
            dataPart = []
            data.forEach(function(d, i) {
                var obj = {main: d, ref: dataRef[i]}
                i % 3 == 0 && i != 0 ? (dataFull.push(dataPart), dataPart = [obj]) : dataPart.push(obj)
            })
            dataFull.push(dataPart)
            return dataFull
    },
    runData: function() {
        d3.csv('data/re-emp.csv', function(data) {

            data = data
                .filter(function(d) { return parseFloat(d.RunEnv_) == parseFloat(m.uRunEnv) })
                .filter(function(d) { return parseFloat(d.wOBA) == m.uWoba })
            data.forEach(function(d) {
                d.baseState = parseInt(d['3B'] + d['2B'] + d['1B'], 2)
            });
            data.sort(function(a, b) {
                if (a.baseState == b.baseState) {
                    return a.Outs - b.Outs
                }
                else {
                    return a.baseState - b.baseState
                }
            })
            data = data.map(function(d) { return parseFloat(d.RE) })

            m.reRange = d3.extent(data)
            m.runRef(data)
        })
    },
    runSmo: function() {
        d3.csv('data/re-smo.csv', function(data) {

            var dataFull = []
            m.outs.forEach(function(d) {
                m.baseStates.forEach(function(e) {
                    var eachD = data.filter(function(f) { return parseInt(f['X3B'] + f['X2B'] + f['X1B'], 2) == e && f.O == d })
                    eachD['baseState'] = parseInt(eachD[0]['X3B'] + eachD[0]['X2B'] + eachD[0]['X1B'], 2)
                    eachD['Outs'] = eachD[0].O
                    eachD['RE_smo'] = +eachD[0]['intercept'] + eachD[0]['wOBA.slope'] * m.uWoba + eachD[0]['RunEnv.slope'] * m.uRunEnv 
                    dataFull.push(eachD)
                })
            })
            dataFull.sort(function(a, b) {
                if (a.baseState == b.baseState) {
                    return a.Outs - b.Outs
                }
                else {
                    return a.baseState - b.baseState
                }
            })
            
            data = dataFull.map(function(d) { return d['RE_smo']})           
            m.runRef(data)

        })
    },
    runRef: function(data) {
        d3.csv('data/re-emp.csv', function(dataRef) {
            
            dataRef = dataRef
                // .filter(function(d) { return parseFloat(d.RunEnv_) == parseFloat(m.uRunEnv) })
                .filter(function(d) { return d.wOBA == 'All' })
            dataRef.forEach(function(d) {
                d.baseState = parseInt(d['3B'] + d['2B'] + d['1B'], 2)
            });
            
            dataRef.sort(function(a, b) {
                if (a.baseState == b.baseState) {
                    return a.Outs - b.Outs
                }
                else {
                    return a.baseState - b.baseState
                }
            })
            console.log(dataRef)
            dataRef = dataRef.map(function(d) { return parseFloat(d.RE) })
            
            m.reRangeRef = d3.extent(dataRef)
            m.dataRef = dataRef
            m.data = m.makeArray(data, m.dataRef)
            m.uDisplay == 'table' ? m.table() : m.graph()
            
        })
    }
}

m.initVar()
m.build()
m.interactive()
m.runData()
