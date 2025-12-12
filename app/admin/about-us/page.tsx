'use client';

import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlus, FiEye, FiEyeOff, FiSave, FiX, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

interface AboutCard {
  heading?: string;
  description?: string;
  mainImage?: string;
  smallImage1?: string;
  smallImage2?: string;
  order?: number;
}

interface AboutContent {
  _id?: string;
  section: string;
  aboutCards?: AboutCard[];
  isActive: boolean;
}

export default function AdminAboutUs() {
  const router = useRouter();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [cards, setCards] = useState<AboutCard[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Include inactive content for admin panel
      const response = await fetch('/api/site-content/section/about?includeInactive=true', {
        cache: 'no-store', // Always fetch fresh data
      });
      const data = await response.json();
      console.log('Fetch response:', data);
      
      if (data.success && data.data) {
        const aboutData = data.data;
        console.log('Fetched about data:', aboutData);
        console.log('About cards:', aboutData.aboutCards);
        
        setContent(aboutData);
        
        // Sort cards by order
        if (aboutData.aboutCards && Array.isArray(aboutData.aboutCards) && aboutData.aboutCards.length > 0) {
          const sortedCards = [...aboutData.aboutCards].sort((a: AboutCard, b: AboutCard) => (a.order || 0) - (b.order || 0));
          setCards(sortedCards);
          console.log('Cards set:', sortedCards);
        } else {
          setCards([]);
          console.log('No cards found in response');
        }
      } else if (data.error === 'Content not found') {
        // No content exists yet, that's okay
        setContent(null);
        setCards([]);
        console.log('No content found');
      } else {
        console.error('Unexpected response:', data);
        setContent(null);
        setCards([]);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
      setContent(null);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty cards
      const validCards = cards.filter(
        (card) => card.heading || card.description || card.mainImage || card.smallImage1 || card.smallImage2
      );

      if (validCards.length === 0) {
        alert('Please add at least one card with content before saving.');
        setSaving(false);
        return;
      }

      const cleanedData = {
        section: 'about',
        aboutCards: validCards.map((card, index) => ({
          heading: card.heading || '',
          description: card.description || '',
          mainImage: card.mainImage || '',
          smallImage1: card.smallImage1 || '',
          smallImage2: card.smallImage2 || '',
          order: index,
        })),
        isActive: content?.isActive !== undefined ? content.isActive : true,
      };

      console.log('Saving data:', cleanedData);

      let response;
      if (content?._id) {
        // Update existing
        response = await fetch(`/api/site-content/${content._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedData),
        });
      } else {
        // Create new
        response = await fetch('/api/site-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedData),
        });
      }

      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success && data.data) {
        // Update content state with the response data
        const savedContent = data.data;
        setContent(savedContent);
        
        // Update cards from response
        if (savedContent.aboutCards && Array.isArray(savedContent.aboutCards)) {
          const sortedCards = [...savedContent.aboutCards].sort((a: AboutCard, b: AboutCard) => (a.order || 0) - (b.order || 0));
          setCards(sortedCards);
          console.log('Cards updated from response:', sortedCards);
        } else {
          // Fallback: use the cards we just saved
          setCards(validCards.map((card, index) => ({ ...card, order: index })));
        }
        
        setIsEditing(false);
        setEditingCardIndex(null);
        
        // Also refetch to ensure everything is in sync
        setTimeout(() => {
          fetchContent();
        }, 300);
        
        alert('About Us content saved successfully!');
      } else {
        alert('Error saving content: ' + (data.error || 'Unknown error'));
        console.error('Save error:', data);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!content?._id) return;

    try {
      const response = await fetch(`/api/site-content/${content._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !content.isActive }),
      });

      const data = await response.json();
      if (data.success) {
        fetchContent();
      } else {
        alert('Error updating status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const addCard = () => {
    const newCard: AboutCard = {
      heading: '',
      description: '',
      mainImage: '',
      smallImage1: '',
      smallImage2: '',
      order: cards.length,
    };
    setCards([...cards, newCard]);
    setEditingCardIndex(cards.length);
  };

  const removeCard = (index: number) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
      if (editingCardIndex === index) {
        setEditingCardIndex(null);
      } else if (editingCardIndex !== null && editingCardIndex > index) {
        setEditingCardIndex(editingCardIndex - 1);
      }
    }
  };

  const updateCard = (index: number, field: keyof AboutCard, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === cards.length - 1) return;

    const newCards = [...cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
    setCards(newCards);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600 font-geom">Loading About Us content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-geom">About Us</h1>
          <p className="text-gray-600 mt-1 font-geom">Manage About Us slider cards with heading, description, and images</p>
        </div>
        <div className="flex items-center gap-3">
          {content && (
            <button
              onClick={toggleActive}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors font-geom ${
                content.isActive
                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {content.isActive ? (
                <span className="flex items-center gap-2">
                  <FiEye size={16} /> Visible
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiEyeOff size={16} /> Hidden
                </span>
              )}
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                if (cards.length === 0) {
                  addCard();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium font-geom"
            >
              <FiEdit size={16} />
              {cards.length > 0 ? 'Edit Cards' : 'Create Cards'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary-brown font-geom">Manage About Us Cards</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addCard}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium font-geom"
              >
                <FiPlus size={16} />
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingCardIndex(null);
                  fetchContent();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4 font-geom">No cards yet. Click "Add Card" to create one.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cards.map((card, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary-brown font-geom">Card {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveCard(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:text-primary-red disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <FiArrowUp size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCard(index, 'down')}
                        disabled={index === cards.length - 1}
                        className="p-2 text-gray-600 hover:text-primary-red disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <FiArrowDown size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Delete card"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Heading */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-geom">Heading</label>
                    <input
                      type="text"
                      value={card.heading || ''}
                      onChange={(e) => updateCard(index, 'heading', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red font-geom"
                      placeholder="e.g., A Legacy of Sweet Excellence"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-geom">Description</label>
                    <textarea
                      rows={3}
                      value={card.description || ''}
                      onChange={(e) => updateCard(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red font-geom"
                      placeholder="Enter description text"
                    />
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-geom">Main Image (Large)</label>
                      <ImageUpload
                        value={card.mainImage || ''}
                        onChange={(url) => updateCard(index, 'mainImage', url)}
                        folder="about-us"
                        label=""
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-geom">Small Image 1</label>
                      <ImageUpload
                        value={card.smallImage1 || ''}
                        onChange={(url) => updateCard(index, 'smallImage1', url)}
                        folder="about-us"
                        label=""
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-geom">Small Image 2</label>
                      <ImageUpload
                        value={card.smallImage2 || ''}
                        onChange={(url) => updateCard(index, 'smallImage2', url)}
                        folder="about-us"
                        label=""
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Toggle */}
          <div>
            <label className="flex items-center gap-2 font-geom">
              <input
                type="checkbox"
                checked={content?.isActive !== false}
                onChange={(e) => {
                  if (content) {
                    setContent({ ...content, isActive: e.target.checked });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Show on website</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving || cards.length === 0}
              className="bg-primary-red text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50 font-geom"
            >
              <FiSave size={20} />
              {saving ? 'Saving...' : 'Save Cards'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingCardIndex(null);
                fetchContent();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium font-geom"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Preview */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {cards.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-brown font-geom">
                  About Us Cards ({cards.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary-brown font-geom">Card {index + 1}</h4>
                      <span className="text-xs text-gray-500 font-geom">Order: {index + 1}</span>
                    </div>
                    {card.heading && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1 font-geom">Heading</p>
                        <p className="text-base font-semibold text-primary-brown font-geom">{card.heading}</p>
                      </div>
                    )}
                    {card.description && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1 font-geom">Description</p>
                        <p className="text-sm text-gray-700 font-geom line-clamp-3">{card.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {card.mainImage && (
                        <div className="relative aspect-square rounded overflow-hidden border">
                          <img src={card.mainImage} alt="Main" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {card.smallImage1 && (
                        <div className="relative aspect-square rounded overflow-hidden border">
                          <img src={card.smallImage1} alt="Small 1" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {card.smallImage2 && (
                        <div className="relative aspect-square rounded overflow-hidden border">
                          <img src={card.smallImage2} alt="Small 2" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4 font-geom">No About Us cards configured yet.</p>
              <button
                onClick={() => {
                  setIsEditing(true);
                  addCard();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium font-geom"
              >
                <FiPlus size={18} />
                Create About Us Cards
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
