'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEgressMonitor } from '@/lib/egress-monitor'
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

export function EgressDashboard() {
  const { getStats, getUsagePercentage, getOptimizationRecommendations, clear } = useEgressMonitor()
  const [stats, setStats] = useState(getStats())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStats = async () => {
    setIsRefreshing(true)
    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 500))
    setStats(getStats())
    setIsRefreshing(false)
  }

  useEffect(() => {
    const interval = setInterval(refreshStats, 30000) // Actualizar cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const usagePercentage = getUsagePercentage()
  const recommendations = getOptimizationRecommendations()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = () => {
    if (usagePercentage >= 100) return 'text-red-600'
    if (usagePercentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = () => {
    if (usagePercentage >= 100) return <AlertTriangle className="h-4 w-4" />
    if (usagePercentage >= 80) return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Egress Monitor</h2>
          <p className="text-muted-foreground">
            Monitoreo del uso de ancho de banda de Supabase
          </p>
        </div>
        <Button 
          onClick={refreshStats} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerta de límite */}
      {stats.isOverLimit && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Límite excedido!</strong> Has superado los 5GB mensuales de egress.
            Considera implementar optimizaciones inmediatas.
          </AlertDescription>
        </Alert>
      )}

      {stats.isNearLimit && !stats.isOverLimit && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Atención:</strong> Estás cerca del límite de egress (80%+).
            Considera implementar optimizaciones.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uso total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
            {getStatusIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.totalEgress)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={usagePercentage} className="flex-1" />
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Límite: 5.00 GB
            </p>
          </CardContent>
        </Card>

        {/* Últimas 24h */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.last24h.size)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.last24h.count} requests
            </p>
          </CardContent>
        </Card>

        {/* Últimos 7 días */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimos 7 días</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.last7d.size)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.last7d.count} requests
            </p>
          </CardContent>
        </Card>

        {/* Estado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            {getStatusIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.isOverLimit ? 'Crítico' : stats.isNearLimit ? 'Advertencia' : 'Normal'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.isOverLimit ? 'Límite excedido' : 
               stats.isNearLimit ? 'Cerca del límite' : 'Uso normal'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Tipo</CardTitle>
          <CardDescription>
            Distribución del egress por tipo de recurso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, size]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {((size / stats.totalEgress) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-medium">{formatBytes(size)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>
            Endpoints que más egress generan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byEndpoint.map(([endpoint, size], index) => (
              <div key={endpoint} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-mono truncate max-w-xs">
                    {endpoint}
                  </span>
                </div>
                <span className="font-medium">{formatBytes(size)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones de Optimización</CardTitle>
            <CardDescription>
              Sugerencias para reducir el uso de egress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>
            Herramientas para gestionar el monitoreo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={refreshStats} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar Datos
            </Button>
            <Button 
              onClick={clear} 
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Limpiar Historial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

