import React from 'react';
import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          bounce: 0.5
        }}
        className="relative flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-3xl rotate-3 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6">
          <Wallet className="w-12 h-12 text-white -rotate-3" />
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">FinFlow</h1>
          <p className="text-gray-500 font-medium">Your Personal Cashflow</p>
        </motion.div>
        
        <motion.div 
           className="mt-12 flex gap-1.5"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
             <motion.div 
               key={i}
               className="w-2.5 h-2.5 bg-blue-500 rounded-full"
               animate={{ 
                 y: [0, -8, 0],
                 opacity: [0.5, 1, 0.5]
               }}
               transition={{
                 duration: 1,
                 repeat: Infinity,
                 delay: i * 0.15,
                 ease: "easeInOut"
               }}
             />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
