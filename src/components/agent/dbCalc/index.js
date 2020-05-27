import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import styles from './styles.module.scss';

import CodeBlock from '@theme/CodeBlock'

export function Calculator() {
  const [state, setState] = React.useState({
    master: 1,
    slaves: 0,
    dims: 2000,
    update: 1,
    retention: 14,
    compression: 50,
    pageSize: 32,
  })

  const [totalDisk, setTotalDisk ] = React.useState('')
  const [diskSetting, setDiskSetting] = React.useState('')
  const [finalRAM, setFinalRAM] = React.useState('')
  const [conf, setConf] = React.useState('')

  useEffect(() => {
    const nodes = state.master + state.slaves
    const totalDims = nodes * state.dims
    const totalPoints = (totalDims / state.update) * state.retention * 24 * 3600
    const uncompressedPageSize = 4096
    const pointsPerPage = 1024
    const maxPages = totalPoints / pointsPerPage
    const pageSize = uncompressedPageSize / 1024 / 1024
    const uncompressedStorage = maxPages * pageSize
    const requiredDisk = uncompressedStorage * ( 1 - (state.compression / 100))
    const diskSetting = requiredDisk / ( nodes )
    const cacheRAM = state.pageSize * nodes
    const dimPages = totalDims * uncompressedPageSize * 2 / 1024 / 1024
    const metadata = uncompressedStorage * 0.03
    const requiredRAM = cacheRAM + dimPages + metadata

    setTotalDisk(Math.round(requiredDisk))
    setDiskSetting(Math.round(diskSetting))
    setFinalRAM(Math.round(requiredRAM))

    const confString = String.raw`[global]
    dbengine disk space = ${Math.round(diskSetting)}`
    setConf(confString)

  });

  const handleChange = (evt) => {
    const value = parseFloat(evt.target.value);
    setState({
      ...state,
      [evt.target.name]: value
    })
  }

  return (
    <div className={classnames('row', styles.dbCalc)}>
      <div className={'col col--12'}>
        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="retention" name="retention" value={state.retention} onChange={handleChange} />
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="retention">How many days do you want to store metrics?</label>
          </div>
        </div>

        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="update" name="update" value={state.update} onChange={handleChange} />
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="update">How often, on average, do your Agents collect metrics?</label>
            <p>By default, the Agent collects metrics once per second (<code>1</code>). See the <code>update every</code> setting in your <code>netdata.conf</code> file if yours may be different. If you have streaming nodes, use the average of their settings.</p>
          </div>
        </div>

        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="dims" name="dims" min="0" value={state.dims} onChange={handleChange} />
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="dims">How many metrics, on average, do your Agents collect?</label>
            <p>
              To find this value for an Agent, scroll to the bottom of the dashboard to find the number of metrics your Agent collects. If you have streaming nodes, input the average of these values.
            </p>
            {/* <img 
              className='flex'
              src='img/dbengine-calc/dbengine_metrics.png'
              alt='Where to find the number of collected metrics in the Agent dashboard' 
            /> */}
          </div>
        </div>

        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="slaves" name="slaves" min="0" value={state.slaves} onChange={handleChange} />
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="slaves">How many slave streaming nodes do you have?</label>
          </div>
        </div>

        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="compression" name="compression" value={state.compression} onChange={handleChange} />
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="compression">What is your compression savings ratio?</label>
            <p>To find this value, click on the <strong>Netdata Monitoring</strong> &rarr; <strong>dbengine</strong> items in the right-hand menu and look at the first chart under the <strong>dbengine</strong> section. You can also use your browser's search feature to look for <strong>compression savings ratio</strong>. Estimate an average value to input into the calculator.</p>
            {/* <img 
              className={styles.fullWidth}
              src='img/dbengine-calc/dbengine_compression.png'
              alt='Where to find the compression savings ratio in the Agent dashboard'
            /> */}
          </div>
        </div>

        <div className={classnames('row', styles.calcRow)}>
          <div className={classnames('col col--2', styles.calcInput)}>
            <input type="number" id="pageSize" name="pageSize" value={state.pageSize} onChange={handleChange} />
            
          </div>
          <div className={classnames('col col--10', styles.calcInstruction)}>
            <label htmlFor="pageSize">What is your page cache size?</label>
            <p>Open your <code>netdata.conf</code> file and find the <code>page cache size</code> setting in the <code>[global]</code> section.</p>
          </div>
        </div>
      </div>

      <div className={classnames("col col--12", styles.calcResults)}>

        <p>With the current settings, the Netdata Agent will use <code>{totalDisk} MiB</code> in disk space to store your metrics for <strong>{state.retention} days</strong>.</p>
        <p>You should edit your <code>netdata.conf</code> file to change the <code>dbengine disk space</code> setting:</p>
        <CodeBlock className={classnames('conf')} language='conf'>{conf}</CodeBlock>
        <p>The database engine will also use {finalRAM} MiB of system memory, on top of the memory needed to run the rest of the Agent's collection, visualization, and alerting features.</p>

      </div>

    </div>
  );
}