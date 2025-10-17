'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import Link from 'next/link';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  MessageSquare,
  Star,
  Calendar,
  User,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useAdminCommentaires, useUpdateCommentaireStatus, useDeleteCommentaire, useCommentairesStats } from '@/hooks/useAdmin';
import { CommentaireAdmin } from '@/services/adminService';

type SortField = 'nom' | 'note' | 'active' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function AdminCommentairesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage] = useState(10);
  
  const [viewDialog, setViewDialog] = useState<{ open: boolean; commentaire: CommentaireAdmin | null }>({
    open: false,
    commentaire: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; commentaire: CommentaireAdmin | null }>({
    open: false,
    commentaire: null
  });

  // Fetch data
  const { data: commentairesData, isLoading, refetch } = useAdminCommentaires(1, 1000000, '', undefined);
  const { data: statsData } = useCommentairesStats();
  const updateStatusMutation = useUpdateCommentaireStatus();
  const deleteMutation = useDeleteCommentaire();

  // Client-side filtering and sorting
  const filteredCommentaires = commentairesData?.data?.filter((commentaire: CommentaireAdmin) => {
    const matchesSearch = commentaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commentaire.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commentaire.produit_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && commentaire.active === 1) ||
                         (statusFilter === 'inactive' && commentaire.active === 0);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Sort data
  const sortedCommentaires = [...filteredCommentaires].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'note') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else if (sortField === 'created_at') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCommentaires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommentaires = sortedCommentaires.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        active: currentStatus === 1 ? 0 : 1
      });
      refetch();
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.commentaire) return;
    
    try {
      await deleteMutation.mutateAsync(deleteDialog.commentaire.id);
      setDeleteDialog({ open: false, commentaire: null });
      refetch();
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (active: number) => {
    return active === 1 ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Actif
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" />
        Inactif
      </Badge>
    );
  };

  const renderStars = (note: number | null) => {
    if (!note) return <span className="text-gray-400">Aucune note</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, idx) => (
          <Star
            key={idx}
            className={`h-4 w-4 ${
              idx < note ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({note}/5)</span>
      </div>
    );
  };

  const parseImages = (imageString?: string | null): string[] => {
    if (!imageString) return [];
    try {
      const images = JSON.parse(imageString);
      return Array.isArray(images) ? images : [];
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des commentaires...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Commentaires</h1>
            <p className="text-gray-600">
              Modérez et gérez les commentaires des clients sur les biens
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commentaires</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData?.total?.toLocaleString() || '0'}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statsData?.active?.toLocaleString() || '0'}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Modération</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statsData?.inactive?.toLocaleString() || '0'}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsData?.thisMonth?.toLocaleString() || '0'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom, commentaire, produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">En modération</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-2">
                        Auteur
                        {sortField === 'nom' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Commentaire
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Produit
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('note')}
                    >
                      <div className="flex items-center gap-2">
                        Note
                        {sortField === 'note' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('active')}
                    >
                      <div className="flex items-center gap-2">
                        Statut
                        {sortField === 'active' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === 'created_at' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCommentaires.map((commentaire: CommentaireAdmin) => (
                    <tr key={commentaire.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{commentaire.nom}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {commentaire.commentaire}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Link 
                          href={`/biens/${commentaire.produit_code}`}
                          target="_blank"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline group"
                        >
                          <Package className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{commentaire.produit_nom}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        {renderStars(commentaire.note)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(commentaire.active)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(commentaire.created_at)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewDialog({ open: true, commentaire })}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link 
                                href={`/biens/${commentaire.produit_code}`}
                                target="_blank"
                                className="flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Voir le bien
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(commentaire.id, commentaire.active)}
                            >
                              {commentaire.active === 1 ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, commentaire })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedCommentaires.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* View Dialog */}
        <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, commentaire: null })}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Détails du Commentaire
              </DialogTitle>
            </DialogHeader>
            
            {viewDialog.commentaire && (
              <div className="space-y-6 py-4">
                {/* Statut et Note */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(viewDialog.commentaire.active)}
                  {renderStars(viewDialog.commentaire.note)}
                </div>

                {/* Auteur */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Auteur
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium">{viewDialog.commentaire.nom}</p>
                  </div>
                </div>

                {/* Commentaire */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Commentaire
                  </Label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {viewDialog.commentaire.commentaire}
                    </p>
                  </div>
                </div>

                {/* Produit associé */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Produit associé
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <Link 
                      href={`/biens/${viewDialog.commentaire.produit_code}`}
                      target="_blank"
                      className="flex items-start gap-3 group"
                    >
                      {viewDialog.commentaire.produit_image && parseImages(viewDialog.commentaire.produit_image).length > 0 && (
                        <img 
                          src={parseImages(viewDialog.commentaire.produit_image)[0]}
                          alt={viewDialog.commentaire.produit_nom}
                          className="w-16 h-16 object-cover rounded group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                            {viewDialog.commentaire.produit_nom}
                          </p>
                          <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-gray-500">Code: {viewDialog.commentaire.produit_code}</p>
                        <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Cliquez pour voir le bien →
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date de publication
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{formatDate(viewDialog.commentaire.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setViewDialog({ open: false, commentaire: null })}
                className="px-6"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, commentaire: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
                {deleteDialog.commentaire && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="font-medium">{deleteDialog.commentaire.nom}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{deleteDialog.commentaire.commentaire}</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
