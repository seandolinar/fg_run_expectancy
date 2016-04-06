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
         d3.selectAll('.box-1').select('*').remove()

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
            .text(function(d) { return d; })

        reTable.selectAll('tr.val')
            .data(m.data)
            .enter()
            .append('tr')
            .attr('class', 'val')
            .attr('data-row', function(d, i) { return i; })
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
                    .text(function(d) { return d.toFixed(3); })
            })

    },
    highlightTable: function() {
        $('td').removeClass('highlight')
        $('[data-row="' + m.uBaseStates + '"] [data-column="' + m.uOuts + '"]').addClass('highlight')
    },
    graph: function() {
        
        //get reference
        m.foundation()

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
                    .style('width', function(d) { return 50 + '%';})
                    .style('height', '50%')
                    
                    
                    cell
                    .append('div')
                    .style('background-color', '#336699')
                    .style('width', function(d) { return Math.max(X(d),0) + '%';})
                    .style('height', '50%')
            })
        
    },
    build: function() {

        d3.selectAll('.bin').html('')
        console.log(m.uType)
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
    makeArray: function(data) {
            dataFull = []
            dataPart = []
            data.forEach(function(d, i) {
                i % 3 == 0 && i != 0 ? (dataFull.push(dataPart), dataPart = [d]) : dataPart.push(d)
            })
            dataFull.push(dataPart)
            return dataFull
    },
    runData: function() {
        d3.csv('/data/re-emp.csv', function(data) {

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
            m.data = m.makeArray(data)
            m.uDisplay == 'table' ? m.table() : m.graph()
        })
    },
    runSmo: function() {
        d3.csv('/data/re-smo.csv', function(data) {

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
            
            m.data = m.makeArray(dataFull.map(function(d) { return d['RE_smo']}))
            m.uDisplay == 'table' ? m.table() : m.graph()
        })
    },
    runRef: function() {
        d3.csv('/data/re-emp.csv', function(data) {
            
            data
                .filter(function(d) { return parseFloat(d.RunEnv_) == parseFloat(m.uRunEnv) })
                .filter(function(d) { return parseFloat(d.wOBA) == 'All' })
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
            
            m.reRangeRef = d3.extent(data)
            m.dataRef = m.makeArray(data)
            
        })
    }
}

m.initVar()
m.build()
m.interactive()
m.runData()
