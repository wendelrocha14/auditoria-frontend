'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HomeScreen } from '@/components/screens/home-screen'
import { StartScreen } from '@/components/screens/start-screen'
import { SelectScreen } from '@/components/screens/select-screen'
import { AuditScreen } from '@/components/screens/audit-screen'
import type { AuditItem, AuditInfo, Screen } from '@/lib/types'

export default function AuditApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [items, setItems] = useState<AuditItem[]>([])
  const [selectedItems, setSelectedItems] = useState<AuditItem[]>([])
  const [auditInfo, setAuditInfo] = useState<AuditInfo | null>(null)

  const handlePDFUploaded = (uploadedItems: AuditItem[]) => {
    setItems(uploadedItems)
    setScreen('start')
  }

  const handleStartContinue = (info: AuditInfo) => {
    setAuditInfo(info)
    setScreen('select')
  }

  const handleSelectContinue = (selected: AuditItem[]) => {
    setSelectedItems(selected)
    if (auditInfo) {
      setAuditInfo({ ...auditInfo, totalItens: selected.length })
    }
    setScreen('audit')
  }

  const handleFinish = () => {
    // Reset para nova auditoria
    setScreen('home')
    setItems([])
    setSelectedItems([])
    setAuditInfo(null)
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && (
        <motion.div
          key="home"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <HomeScreen onContinue={handlePDFUploaded} />
        </motion.div>
      )}

      {screen === 'start' && (
        <motion.div
          key="start"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <StartScreen
            onBack={() => setScreen('home')}
            onContinue={handleStartContinue}
          />
        </motion.div>
      )}

      {screen === 'select' && (
        <motion.div
          key="select"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <SelectScreen
            items={items}
            onBack={() => setScreen('start')}
            onContinue={handleSelectContinue}
          />
        </motion.div>
      )}

      {screen === 'audit' && auditInfo && (
        <motion.div
          key="audit"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <AuditScreen
            items={selectedItems}
            auditInfo={auditInfo}
            onBack={() => setScreen('select')}
            onFinish={handleFinish}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
